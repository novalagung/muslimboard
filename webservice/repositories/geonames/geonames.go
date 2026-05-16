package geonames

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/getsentry/sentry-go"
	_ "modernc.org/sqlite"
	"muslimboard-api.novalagung.com/models"
	pkg_common "muslimboard-api.novalagung.com/pkg/common"
	"muslimboard-api.novalagung.com/pkg/logger"
	pkg_redis "muslimboard-api.novalagung.com/pkg/redis"
)

var queryTokenPattern = regexp.MustCompile(`[^\p{L}\p{N}]+`)

func dbPath() string {
	if path := os.Getenv("GEONAMES_DB_PATH"); path != "" {
		return path
	}
	if _, err := os.Stat("/data/geonames.sqlite"); err == nil {
		return "/data/geonames.sqlite"
	}
	return "./data/geonames.sqlite"
}

func normalizeQuery(query string) string {
	return strings.Join(strings.Fields(strings.ToLower(strings.TrimSpace(query))), " ")
}

func buildFTSQuery(query string) string {
	parts := queryTokenPattern.Split(normalizeQuery(query), -1)
	tokens := make([]string, 0, len(parts))
	for _, part := range parts {
		if part == "" {
			continue
		}
		tokens = append(tokens, part+"*")
	}
	return strings.Join(tokens, " ")
}

func SearchLocations(ctx context.Context, query string, limit int) ([]Location, error) {
	namespace := "repositories.geonames.SearchLocations"
	span := sentry.StartSpan(ctx, namespace)
	span.Data = map[string]any{
		"query": query,
		"limit": limit,
	}
	defer span.Finish()

	query = normalizeQuery(query)
	if len([]rune(query)) < 3 {
		return nil, fmt.Errorf("query must contain at least 3 characters")
	}
	if limit <= 0 || limit > 10 {
		limit = 10
	}

	cacheKey := fmt.Sprintf("%s:%s:%d", namespace, query, limit)
	cachedRes, err := pkg_redis.NewRedis().Get(ctx, cacheKey).Result()
	if err == nil {
		cachedData := make([]Location, 0)
		if err := pkg_common.ConvertTo(cachedRes, &cachedData); err == nil {
			pkg_redis.NewRedis().Set(ctx, cacheKey, cachedRes, models.RedisKeepAliveDuration).Err()
			logger.Log.Debugln(namespace, "load from cache", cacheKey)
			return cachedData, nil
		}
	}

	db, err := sql.Open("sqlite", dbPath())
	if err != nil {
		logger.Log.Errorln(namespace, "sql.Open", err)
		return nil, err
	}
	defer db.Close()

	ctxr, cancel := context.WithTimeout(ctx, models.ApiCallTimeoutDuration)
	defer cancel()

	ftsQuery := buildFTSQuery(query)
	if ftsQuery == "" {
		return nil, fmt.Errorf("query must contain letters or numbers")
	}
	prefixQuery := query + "%"
	rows, err := db.QueryContext(ctxr, `
		SELECT
			l.geoname_id,
			l.name,
			l.admin1_name,
			l.admin2_name,
			l.country_code,
			l.country_name,
			l.latitude,
			l.longitude,
			l.timezone,
			l.population
		FROM location_search s
		JOIN locations l ON l.geoname_id = s.location_id
		WHERE s.searchable MATCH ?
		ORDER BY
			CASE
				WHEN lower(l.name) = ? OR lower(l.ascii_name) = ? THEN 0
				WHEN lower(l.name) LIKE ? OR lower(l.ascii_name) LIKE ? THEN 1
				ELSE 2
			END,
			l.population DESC,
			l.name ASC
		LIMIT ?
	`, ftsQuery, query, query, prefixQuery, prefixQuery, limit)
	if err != nil {
		logger.Log.Errorln(namespace, "db.QueryContext", err)
		return nil, err
	}
	defer rows.Close()

	locations := make([]Location, 0)
	for rows.Next() {
		var location Location
		if err := rows.Scan(
			&location.ID,
			&location.Name,
			&location.Admin1Name,
			&location.Admin2Name,
			&location.CountryCode,
			&location.CountryName,
			&location.Latitude,
			&location.Longitude,
			&location.Timezone,
			&location.Population,
		); err != nil {
			logger.Log.Errorln(namespace, "rows.Scan", err)
			return nil, err
		}
		locations = append(locations, location)
	}
	if err := rows.Err(); err != nil {
		logger.Log.Errorln(namespace, "rows.Err", err)
		return nil, err
	}

	pkg_redis.NewRedis().Set(ctx, cacheKey, pkg_common.ConvertToJsonString(locations), models.RedisKeepAliveDuration).Err()
	return locations, nil
}

func ParseLimit(raw string) int {
	limit, err := strconv.Atoi(raw)
	if err != nil {
		return 10
	}
	if limit <= 0 || limit > 10 {
		return 10
	}
	return limit
}

func CacheDuration() time.Duration {
	return models.RedisKeepAliveDuration
}
