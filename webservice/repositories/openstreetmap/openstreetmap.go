package openstreetmap

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/go-resty/resty/v2"
	log "github.com/sirupsen/logrus"
	"muslimboard-api.novalagung.com/models"
)

// GetCoordinateByLocation do get coordinate by location details
func GetCoordinateByLocation(ctx context.Context, location string) (map[string]any, error) {
	namespace := "repositories.openstreetmap.GetCoordinateByLocation"

	// dispatch query to open street map geocoding api
	resp, err := resty.New().
		SetDebug(os.Getenv("DEBUG") == "true").
		R().
		SetContext(ctx).
		SetHeader("User-Agent", models.UserAgent).
		SetQueryParams(map[string]string{
			"format": "json",
			"q":      location,
			"limit":  "1",
		}).
		Get("https://nominatim.openstreetmap.org/")
	if err != nil {
		log.Errorln(namespace, "resty.Get", err)
		return nil, err
	}
	if resp.IsError() {
		err = fmt.Errorf("%v", resp.Error())
		log.Errorln(namespace, "resp.IsError", err)
		return nil, err
	}

	// parse geocoding response
	var coordinates []Geocoding
	err = json.Unmarshal(resp.Body(), &coordinates)
	if err != nil {
		log.Errorln(namespace, "json.Unmarshal", err)
		return nil, err
	}

	if coordinates == nil {
		err = fmt.Errorf("coordinates not found")
		log.Errorln(namespace, "coordinates", err)
		return nil, err
	}

	if len(coordinates) == 0 {
		err = fmt.Errorf("coordinates not found")
		log.Errorln(namespace, "len(coordinates) == 0", err)
		return nil, err
	}

	// write response
	data := map[string]any{
		"lat":     coordinates[0].Lat,
		"lon":     coordinates[0].Lon,
		"address": location,
	}
	return data, nil
}

// GetLocationByCoordinate do get location details by coordinate
func GetLocationByCoordinate(ctx context.Context, latitude, longitude string) (map[string]any, error) {
	namespace := "repositories.openstreetmap.GetLocationByCoordinate"

	// dispatch query to open street map geocoding api
	resp, err := resty.New().
		SetDebug(os.Getenv("DEBUG") == "true").
		R().
		SetContext(ctx).
		SetHeader("User-Agent", models.UserAgent).
		SetQueryParams(map[string]string{
			"format":         "json",
			"q":              fmt.Sprintf(`%s,%s`, latitude, longitude),
			"addressdetails": "true",
			"namedetails":    "true",
		}).
		Get("https://nominatim.openstreetmap.org/search")
	if err != nil {
		log.Errorln(namespace, "resty.Get", err)
		return nil, err
	}
	if resp.IsError() {
		err = fmt.Errorf("%v", resp.Error())
		log.Errorln(namespace, "resp.IsError", err)
		return nil, err
	}

	// parse geocoding response
	var location []Geocoding
	err = json.Unmarshal(resp.Body(), &location)
	if err != nil {
		log.Errorln(namespace, "json.Unmarshal", err)
		return nil, err
	}

	if location == nil {
		err = fmt.Errorf("location not found")
		log.Errorln(namespace, "location", err)
		return nil, err
	}

	if len(location) == 0 {
		err = fmt.Errorf("location not found")
		log.Errorln(namespace, "len(location) == 0", err)
		return nil, err
	}

	// construct readable address as output
	addressParts := make([]string, 0)
	if p := location[0].Address.Road; p != "" {
		addressParts = append(addressParts, p)
	}
	if p := location[0].Address.Postcode; p != "" {
		addressParts = append(addressParts, p)
	}
	if p := location[0].Address.City; p != "" {
		addressParts = append(addressParts, p)
	}
	if p := location[0].Address.State; p != "" {
		addressParts = append(addressParts, p)
	}
	if p := location[0].Address.Country; p != "" {
		addressParts = append(addressParts, p)
	}
	address := strings.Join(addressParts, ", ")

	// use display name if address is too short
	if len(addressParts) < 3 {
		address = location[0].DisplayName
	}

	// write response
	return map[string]any{
		"lat":         location[0].Lat,
		"lon":         location[0].Lon,
		"address":     address,
		"countryCode": location[0].Address.CountryCode,
	}, nil
}
