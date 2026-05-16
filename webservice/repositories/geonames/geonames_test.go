package geonames

import (
	"context"
	"database/sql"
	"path/filepath"
	"testing"

	_ "modernc.org/sqlite"
)

func TestSearchLocations(t *testing.T) {
	path := filepath.Join(t.TempDir(), "geonames.sqlite")
	db, err := sql.Open("sqlite", path)
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()

	statements := []string{
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
		`INSERT INTO locations VALUES (1650357, 'Bandung', 'Bandung', 'West Java', 'Kota Bandung', 'ID', 'Indonesia', -6.92222, 107.60694, 'Asia/Jakarta', 1699719, '40123')`,
		`INSERT INTO location_search VALUES (1650357, 'Bandung Bandoeng West Java Kota Bandung Indonesia ID 40123')`,
	}
	for _, stmt := range statements {
		if _, err := db.Exec(stmt); err != nil {
			t.Fatal(err)
		}
	}

	t.Setenv("GEONAMES_DB_PATH", path)
	locations, err := SearchLocations(context.Background(), "bandoeng", 10)
	if err != nil {
		t.Fatal(err)
	}
	if len(locations) != 1 {
		t.Fatalf("expected 1 location, got %d", len(locations))
	}
	if locations[0].Name != "Bandung" {
		t.Fatalf("expected Bandung, got %s", locations[0].Name)
	}
	if locations[0].PostalCode != "40123" {
		t.Fatalf("expected postal code 40123, got %s", locations[0].PostalCode)
	}

	locationsByPostalCode, err := SearchLocations(context.Background(), "40123", 10)
	if err != nil {
		t.Fatal(err)
	}
	if len(locationsByPostalCode) != 1 {
		t.Fatalf("expected 1 location by postal code, got %d", len(locationsByPostalCode))
	}
	if locationsByPostalCode[0].Name != "Bandung" {
		t.Fatalf("expected Bandung by postal code, got %s", locationsByPostalCode[0].Name)
	}
	if locationsByPostalCode[0].PostalCode != "40123" {
		t.Fatalf("expected postal code 40123, got %s", locationsByPostalCode[0].PostalCode)
	}
}
