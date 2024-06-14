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
	coordinates := []struct {
		PlaceID     int      `json:"place_id"`
		Licence     string   `json:"licence"`
		OsmType     string   `json:"osm_type"`
		OsmID       int      `json:"osm_id"`
		Boundingbox []string `json:"boundingbox"`
		Lat         string   `json:"lat"`
		Lon         string   `json:"lon"`
		DisplayName string   `json:"display_name"`
		Class       string   `json:"class"`
		Type        string   `json:"type"`
		Importance  float64  `json:"importance"`
		Icon        string   `json:"icon"`
	}{}
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
			"format": "json",
			"lat":    latitude,
			"lon":    longitude,
		}).
		Get("https://nominatim.openstreetmap.org/reverse")
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
	location := struct {
		PlaceID     int    `json:"place_id"`
		Licence     string `json:"licence"`
		OsmType     string `json:"osm_type"`
		OsmID       int    `json:"osm_id"`
		Lat         string `json:"lat"`
		Lon         string `json:"lon"`
		DisplayName string `json:"display_name"`
		Address     struct {
			Amenity       string `json:"amenity"`
			Road          string `json:"road"`
			Neighbourhood string `json:"neighbourhood"`
			Suburb        string `json:"suburb"`
			Village       string `json:"village"`
			County        string `json:"county"`
			City          string `json:"city"`
			State         string `json:"state"`
			Postcode      string `json:"postcode"`
			Country       string `json:"country"`
			CountryCode   string `json:"country_code"`
		} `json:"address"`
		Boundingbox []string `json:"boundingbox"`
	}{}
	err = json.Unmarshal(resp.Body(), &location)
	if err != nil {
		log.Errorln(logNamespace, "json.Unmarshal", err.Error())
		return nil, err
	}

	// construct readable address as output
	addressParts := make([]string, 0)
	if p := location.Address.Road; p != "" {
		addressParts = append(addressParts, p)
	}
	if p := location.Address.Postcode; p != "" {
		addressParts = append(addressParts, p)
	}
	if p := location.Address.City; p != "" {
		addressParts = append(addressParts, p)
	}
	if p := location.Address.State; p != "" {
		addressParts = append(addressParts, p)
	}
	if p := location.Address.Country; p != "" {
		addressParts = append(addressParts, p)
	}
	address := strings.Join(addressParts, ", ")

	// use display name if address is too short
	if len(addressParts) < 3 {
		address = location.DisplayName
	}

	// write response
	data := map[string]interface{}{
		"lat":         location.Lat,
		"lon":         location.Lon,
		"address":     address,
		"countryCode": location.Address.CountryCode,
	}
	return data, nil
}
