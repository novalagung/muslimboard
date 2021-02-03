package ws

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-resty/resty/v2"
)

// GetLocationByCoordinate do get location details by coordinate
func GetLocationByCoordinate(w http.ResponseWriter, r *http.Request) {

	// cors configuration
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "OPTIONS, GET")
	w.Header().Set("Access-Control-Allow-Headers", "*")

	if cache := r.URL.Query().Get("cache"); cache == "0" {
		// disable cache control if param `cache` is set to `0`
		w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
		w.Header().Set("Pragma", "no-cache")
		w.Header().Set("Expires", "0")
	} else {
		// by default enable cache control
		w.Header().Set("Cache-Control", "max-age=31536000")
	}

	writeRespose := func(w http.ResponseWriter, statusCode int, resp interface{}, errMessage string) {
		w.Header().Set("Content-type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status_code":   statusCode,
			"data":          resp,
			"error_message": errMessage,
		})
	}

	// parse lat long
	latitude := r.URL.Query().Get("lat")
	latInt, _ := strconv.ParseFloat(latitude, 64)
	longitude := r.URL.Query().Get("lon")
	lonInt, _ := strconv.ParseFloat(longitude, 64)

	// if lat long is invalid, then simply return true
	if latInt == 0 && lonInt == 0 {
		writeRespose(w, http.StatusOK, true, "")
		return
	}

	// dispatch query to open street map geocoding api
	resp, err := resty.New().R().
		SetQueryParams(map[string]string{
			"format": "json",
			"lat":    latitude,
			"lon":    longitude,
		}).
		Get("https://nominatim.openstreetmap.org/reverse")
	if err != nil {
		writeRespose(w, http.StatusInternalServerError, nil, err.Error())
		return
	}
	if resp.IsError() {
		writeRespose(w, http.StatusInternalServerError, nil, fmt.Sprintf("%v", resp.Error()))
		return
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
			Village       string `json:"village"`
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
		writeRespose(w, http.StatusInternalServerError, nil, err.Error())
		return
	}

	// construct readable address as output
	address := make([]string, 0)
	if p := location.Address.Amenity; p != "" {
		address = append(address, p)
	}
	if p := location.Address.Road; p != "" {
		address = append(address, p)
	}
	if p := location.Address.Neighbourhood; p != "" {
		address = append(address, p)
	}
	if p := location.Address.City; p != "" {
		address = append(address, p)
	}
	if p := location.Address.State; p != "" {
		address = append(address, p)
	}

	// write response
	data := map[string]interface{}{
		"lat":     location.Lat,
		"lon":     location.Lon,
		"address": strings.Join(address, ", "),
	}
	writeRespose(w, http.StatusOK, data, "")
}
