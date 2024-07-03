package openstreetmap

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/go-resty/resty/v2"
	log "github.com/sirupsen/logrus"
	"muslimboard-api.novalagung.com/dtos"
	"muslimboard-api.novalagung.com/models"
	"os"
	"strings"
)

// GetCoordinateByLocation do get coordinate by location details
func GetCoordinateByLocation(ctx context.Context, location string) (map[string]interface{}, error) {
	logNamespace := "repositories.openstreetmap.GetCoordinateByLocation"

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
		log.Errorln(logNamespace, "resty.Get", err.Error())
		return nil, err
	}
	if resp.IsError() {
		err = fmt.Errorf("%v", resp.Error())
		log.Errorln(logNamespace, "resp.IsError", err.Error())
		return nil, err
	}

	// parse geocoding response
	var coordinates []dtos.GeocodingResponseDto
	err = json.Unmarshal(resp.Body(), &coordinates)
	if err != nil {
		log.Errorln(logNamespace, "json.Unmarshal", err.Error())
		return nil, err
	}

	if coordinates == nil {
		err = fmt.Errorf("coordinates not found")
		log.Errorln(logNamespace, "coordinates", err.Error())
		return nil, err
	}

	if len(coordinates) == 0 {
		err = fmt.Errorf("coordinates not found")
		log.Errorln(logNamespace, "len(coordinates) == 0", err.Error())
		return nil, err
	}

	// write response
	data := map[string]interface{}{
		"lat":     coordinates[0].Lat,
		"lon":     coordinates[0].Lon,
		"address": location,
	}
	return data, nil
}

// GetLocationByCoordinate do get location details by coordinate
func GetLocationByCoordinate(ctx context.Context, latitude, longitude string) (map[string]interface{}, error) {
	logNamespace := "repositories.openstreetmap.GetLocationByCoordinate"

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
		log.Errorln(logNamespace, "resty.Get", err.Error())
		return nil, err
	}
	if resp.IsError() {
		err = fmt.Errorf("%v", resp.Error())
		log.Errorln(logNamespace, "resp.IsError", err.Error())
		return nil, err
	}

	// parse geocoding response
	var location []dtos.GeocodingResponseDto
	err = json.Unmarshal(resp.Body(), &location)
	if err != nil {
		log.Errorln(logNamespace, "json.Unmarshal", err.Error())
		return nil, err
	}

	if location == nil {
		err = fmt.Errorf("location not found")
		log.Errorln(logNamespace, "location", err.Error())
		return nil, err
	}

	if len(location) == 0 {
		err = fmt.Errorf("location not found")
		log.Errorln(logNamespace, "len(location) == 0", err.Error())
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
	return map[string]interface{}{
		"lat":         location[0].Lat,
		"lon":         location[0].Lon,
		"address":     address,
		"countryCode": location[0].Address.CountryCode,
	}, nil
}
