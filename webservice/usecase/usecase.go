package usecase

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"strconv"
	"strings"

	"github.com/getsentry/sentry-go"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
	"muslimboard-api.novalagung.com/repositories/aladhan"
	"muslimboard-api.novalagung.com/repositories/unsplash"
)

func GetImage(ctx context.Context, imageUrl string) (string, io.ReadCloser, error) {
	return unsplash.GetImage(ctx, imageUrl)
}

// GetShalatScheduleByCoordinate is handler of get shalat schedule by coordinate
func GetShalatScheduleByCoordinate(ctx context.Context, method, latitude, longitude, month, year string) (map[string]interface{}, error) {
	namespace := "usecase.GetShalatScheduleByCoordinate"

	span := sentry.StartSpan(ctx, namespace)
	span.Description = namespace
	span.Finish()

	// if lat long is invalid, then simply return true
	latInt, _ := strconv.ParseFloat(latitude, 64)
	lonInt, _ := strconv.ParseFloat(longitude, 64)

	schedules, err := aladhan.GetShalatScheduleByCoordinate(span.Context(), method, latInt, lonInt, month, year)
	if err != nil {
		slog.Error(namespace, "getShalatScheduleByCoordinate", err)
		return nil, err
	}

	res := map[string]interface{}{
		"schedules":   schedules,
		"address":     "",
		"countryCode": "id",
	}

	locationRes, err := aladhan.GetLocationByCoordinate(span.Context(), latitude, longitude)
	if err != nil {
		slog.Error(namespace, "getLocationByCoordinate", err)
		return nil, err
	}

	res["address"] = locationRes["address"]
	res["countryCode"] = locationRes["countryCode"]

	return res, nil
}

// GetShalatScheduleByLocation is handler of get shalat schedule by location
// for now, immediately use aladhan.com api coz kemenag backend still under development
func GetShalatScheduleByLocation(ctx context.Context, method, province, city, month, year string) (map[string]interface{}, error) {
	namespace := "handler.GetShalatScheduleByLocation"

	span := sentry.StartSpan(ctx, namespace)
	span.Description = namespace
	span.Finish()

	location := fmt.Sprintf("%s,%s", city, province)
	location = strings.ToLower(location)
	location = strings.Replace(location, "d.i. ", "", -1)
	location = strings.Replace(location, "kab. ", "", -1)
	location = strings.Replace(location, "kota ", "", -1)
	location = strings.TrimSpace(location)

	// get coordinate by location
	coordinate, err := aladhan.GetCoordinateByLocation(span.Context(), location)
	if err != nil {
		slog.Error(namespace, "getCoordinateByLocation", err)
		return nil, err
	}

	// parse result
	latitude, _ := strconv.ParseFloat(coordinate["lat"].(string), 64)
	longitude, _ := strconv.ParseFloat(coordinate["lon"].(string), 64)

	schedules, err := aladhan.GetShalatScheduleByCoordinate(span.Context(), method, latitude, longitude, month, year)
	if err != nil {
		slog.Error(namespace, "getShalatScheduleByCoordinate", err)
		return nil, err
	}

	address := cases.Title(language.English).String(strings.ToLower(fmt.Sprintf("%s, %s", city, province)))
	res := map[string]interface{}{
		"schedules":   schedules,
		"address":     address,
		"countryCode": "id",
	}

	return res, nil
}
