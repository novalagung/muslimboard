package main

import (
	"archive/zip"
	"bufio"
	"database/sql"
	"flag"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"

	_ "modernc.org/sqlite"
)

type cityRecord struct {
	ID          int64
	Name        string
	ASCIIName   string
	Latitude    float64
	Longitude   float64
	FeatureCode string
	CountryCode string
	Admin1Code  string
	Admin2Code  string
	Population  int64
	Timezone    string
	AltNames    []string
	PostalCodes []string
}

var normalizeTokenPattern = regexp.MustCompile(`[^\p{L}\p{N}]+`)

func main() {
	dataDir := flag.String("data-dir", "data/geonames", "directory containing GeoNames dump files")
	output := flag.String("output", "data/geonames.sqlite", "SQLite output path")
	flag.Parse()

	countries, err := readCountryInfo(filepath.Join(*dataDir, "countryInfo.txt"))
	must(err)
	admin1, err := readAdminNames(filepath.Join(*dataDir, "admin1CodesASCII.txt"))
	must(err)
	admin2, err := readAdminNames(filepath.Join(*dataDir, "admin2Codes.txt"))
	must(err)
	cities, err := readCities(filepath.Join(*dataDir, "cities500.zip"))
	must(err)
	must(readAlternateNames(filepath.Join(*dataDir, "alternateNamesV2.zip"), cities))
	must(readPostalCodes(filepath.Join(*dataDir, "allCountries.zip"), cities))
	must(writeDatabase(*output, countries, admin1, admin2, cities))

	log.Printf("generated %s with %d locations", *output, len(cities))
}

func must(err error) {
	if err != nil {
		log.Fatal(err)
	}
}

func readCountryInfo(path string) (map[string]string, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	countries := make(map[string]string)
	scanner := bufio.NewScanner(file)
	scanner.Buffer(make([]byte, 1024), 1024*1024)
	for scanner.Scan() {
		line := scanner.Text()
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.Split(line, "\t")
		if len(parts) < 5 {
			continue
		}
		countries[parts[0]] = parts[4]
	}
	return countries, scanner.Err()
}

func readAdminNames(path string) (map[string]string, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	names := make(map[string]string)
	scanner := bufio.NewScanner(file)
	scanner.Buffer(make([]byte, 1024), 1024*1024)
	for scanner.Scan() {
		parts := strings.Split(scanner.Text(), "\t")
		if len(parts) < 2 {
			continue
		}
		names[parts[0]] = parts[1]
	}
	return names, scanner.Err()
}

func openFirstZipFile(path string) (io.ReadCloser, error) {
	reader, err := zip.OpenReader(path)
	if err != nil {
		return nil, err
	}
	if len(reader.File) == 0 {
		reader.Close()
		return nil, fmt.Errorf("%s has no files", path)
	}
	file, err := reader.File[0].Open()
	if err != nil {
		reader.Close()
		return nil, err
	}
	return struct {
		io.Reader
		io.Closer
	}{Reader: file, Closer: multiCloser{file, reader}}, nil
}

type multiCloser []io.Closer

func (m multiCloser) Close() error {
	var err error
	for _, closer := range m {
		if closeErr := closer.Close(); closeErr != nil && err == nil {
			err = closeErr
		}
	}
	return err
}

func readCities(path string) (map[int64]*cityRecord, error) {
	file, err := openFirstZipFile(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	cities := make(map[int64]*cityRecord)
	scanner := bufio.NewScanner(file)
	scanner.Buffer(make([]byte, 1024), 4*1024*1024)
	for scanner.Scan() {
		parts := strings.Split(scanner.Text(), "\t")
		if len(parts) < 19 {
			continue
		}
		id, _ := strconv.ParseInt(parts[0], 10, 64)
		lat, _ := strconv.ParseFloat(parts[4], 64)
		lon, _ := strconv.ParseFloat(parts[5], 64)
		population, _ := strconv.ParseInt(parts[14], 10, 64)
		altNames := splitAlternateNames(parts[3])
		cities[id] = &cityRecord{
			ID:          id,
			Name:        parts[1],
			ASCIIName:   parts[2],
			Latitude:    lat,
			Longitude:   lon,
			FeatureCode: parts[7],
			CountryCode: parts[8],
			Admin1Code:  parts[10],
			Admin2Code:  parts[11],
			Population:  population,
			Timezone:    parts[17],
			AltNames:    altNames,
		}
	}
	return cities, scanner.Err()
}

func readAlternateNames(path string, cities map[int64]*cityRecord) error {
	file, err := openFirstZipFile(path)
	if err != nil {
		return err
	}
	defer file.Close()

	seen := make(map[int64]map[string]bool)
	scanner := bufio.NewScanner(file)
	scanner.Buffer(make([]byte, 1024), 4*1024*1024)
	for scanner.Scan() {
		parts := strings.Split(scanner.Text(), "\t")
		if len(parts) < 4 {
			continue
		}
		id, _ := strconv.ParseInt(parts[1], 10, 64)
		city, ok := cities[id]
		if !ok {
			continue
		}
		name := strings.TrimSpace(parts[3])
		if !isUsefulAlternateName(name) {
			continue
		}
		key := strings.ToLower(name)
		if seen[id] == nil {
			seen[id] = make(map[string]bool)
		}
		if seen[id][key] {
			continue
		}
		seen[id][key] = true
		city.AltNames = append(city.AltNames, name)
	}
	return scanner.Err()
}

func splitAlternateNames(value string) []string {
	names := make([]string, 0)
	for _, name := range strings.Split(value, ",") {
		name = strings.TrimSpace(name)
		if isUsefulAlternateName(name) {
			names = append(names, name)
		}
	}
	return names
}

func isUsefulAlternateName(name string) bool {
	if len([]rune(name)) < 2 || len([]rune(name)) > 80 {
		return false
	}
	lower := strings.ToLower(name)
	return !strings.HasPrefix(lower, "http://") && !strings.HasPrefix(lower, "https://")
}

func normalizeLookupToken(value string) string {
	parts := normalizeTokenPattern.Split(strings.ToLower(strings.TrimSpace(value)), -1)
	normalized := make([]string, 0, len(parts))
	for _, part := range parts {
		if part == "" {
			continue
		}
		normalized = append(normalized, part)
	}
	return strings.Join(normalized, " ")
}

func normalizePostalCodeCompact(value string) string {
	parts := normalizeTokenPattern.Split(strings.ToUpper(strings.TrimSpace(value)), -1)
	return strings.Join(parts, "")
}

func primaryPostalCode(codes []string) string {
	for _, code := range codes {
		code = strings.TrimSpace(code)
		if code != "" {
			return code
		}
	}
	return ""
}

func buildCityLookupIndex(cities map[int64]*cityRecord) map[string]map[string][]*cityRecord {
	index := make(map[string]map[string][]*cityRecord)
	for _, city := range cities {
		country := strings.ToUpper(strings.TrimSpace(city.CountryCode))
		if index[country] == nil {
			index[country] = make(map[string][]*cityRecord)
		}
		seen := make(map[string]bool)
		candidates := append([]string{city.Name, city.ASCIIName}, city.AltNames...)
		for _, name := range candidates {
			token := normalizeLookupToken(name)
			if token == "" || seen[token] {
				continue
			}
			seen[token] = true
			index[country][token] = append(index[country][token], city)
		}
	}
	return index
}

func readPostalCodes(path string, cities map[int64]*cityRecord) error {
	file, err := openFirstZipFile(path)
	if err != nil {
		return err
	}
	defer file.Close()

	index := buildCityLookupIndex(cities)
	seenByCity := make(map[int64]map[string]bool)

	scanner := bufio.NewScanner(file)
	scanner.Buffer(make([]byte, 1024), 4*1024*1024)
	for scanner.Scan() {
		parts := strings.Split(scanner.Text(), "\t")
		if len(parts) < 11 {
			continue
		}
		countryCode := strings.ToUpper(strings.TrimSpace(parts[0]))
		postalCodeRaw := strings.TrimSpace(parts[1])
		placeName := normalizeLookupToken(parts[2])
		admin1Code := strings.TrimSpace(parts[4])
		lat, _ := strconv.ParseFloat(parts[9], 64)
		lon, _ := strconv.ParseFloat(parts[10], 64)
		if countryCode == "" || postalCodeRaw == "" || placeName == "" {
			continue
		}

		cityCandidates := index[countryCode][placeName]
		if len(cityCandidates) == 0 {
			continue
		}

		selected := cityCandidates[0]
		bestScore := 3
		bestDistance := 0.0
		for i, candidate := range cityCandidates {
			score := 1
			if admin1Code != "" && candidate.Admin1Code == admin1Code {
				score = 0
			}
			distance := (candidate.Latitude-lat)*(candidate.Latitude-lat) + (candidate.Longitude-lon)*(candidate.Longitude-lon)
			if i == 0 || score < bestScore || (score == bestScore && distance < bestDistance) {
				selected = candidate
				bestScore = score
				bestDistance = distance
			}
		}

		if seenByCity[selected.ID] == nil {
			seenByCity[selected.ID] = make(map[string]bool)
		}

		codes := []string{strings.ToUpper(postalCodeRaw)}
		compactCode := normalizePostalCodeCompact(postalCodeRaw)
		if compactCode != "" && compactCode != codes[0] {
			codes = append(codes, compactCode)
		}

		for _, code := range codes {
			if code == "" || seenByCity[selected.ID][code] {
				continue
			}
			seenByCity[selected.ID][code] = true
			selected.PostalCodes = append(selected.PostalCodes, code)
		}
	}
	return scanner.Err()
}

func writeDatabase(path string, countries, admin1, admin2 map[string]string, cities map[int64]*cityRecord) error {
	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		return err
	}
	_ = os.Remove(path)

	db, err := sql.Open("sqlite", path)
	if err != nil {
		return err
	}
	defer db.Close()

	statements := []string{
		`PRAGMA journal_mode = WAL`,
		`CREATE TABLE locations (
			geoname_id INTEGER PRIMARY KEY,
			name TEXT NOT NULL,
			ascii_name TEXT NOT NULL,
			admin1_name TEXT NOT NULL,
			admin2_name TEXT NOT NULL,
			country_code TEXT NOT NULL,
			country_name TEXT NOT NULL,
			latitude REAL NOT NULL,
			longitude REAL NOT NULL,
			timezone TEXT NOT NULL,
			population INTEGER NOT NULL,
			postal_code TEXT NOT NULL DEFAULT ''
		)`,
		`CREATE VIRTUAL TABLE location_search USING fts5(location_id UNINDEXED, searchable, tokenize='unicode61 remove_diacritics 2')`,
	}
	for _, stmt := range statements {
		if _, err := db.Exec(stmt); err != nil {
			return err
		}
	}

	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	locationStmt, err := tx.Prepare(`INSERT INTO locations (
		geoname_id, name, ascii_name, admin1_name, admin2_name, country_code, country_name,
		latitude, longitude, timezone, population, postal_code
	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
	if err != nil {
		return err
	}
	defer locationStmt.Close()

	searchStmt, err := tx.Prepare(`INSERT INTO location_search (location_id, searchable) VALUES (?, ?)`)
	if err != nil {
		return err
	}
	defer searchStmt.Close()

	for _, city := range cities {
		admin1Name := admin1[city.CountryCode+"."+city.Admin1Code]
		admin2Name := admin2[city.CountryCode+"."+city.Admin1Code+"."+city.Admin2Code]
		countryName := countries[city.CountryCode]
		if _, err := locationStmt.Exec(
			city.ID,
			city.Name,
			city.ASCIIName,
			admin1Name,
			admin2Name,
			city.CountryCode,
			countryName,
			city.Latitude,
			city.Longitude,
			city.Timezone,
			city.Population,
			primaryPostalCode(city.PostalCodes),
		); err != nil {
			return err
		}

		searchable := strings.Join(append([]string{
			city.Name,
			city.ASCIIName,
			admin1Name,
			admin2Name,
			countryName,
			city.CountryCode,
		}, append(city.AltNames, city.PostalCodes...)...), " ")
		if _, err := searchStmt.Exec(city.ID, searchable); err != nil {
			return err
		}
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	_, err = db.Exec(`CREATE INDEX idx_locations_population ON locations(population DESC)`)
	return err
}
