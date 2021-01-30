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
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "OPTIONS, GET")
	w.Header().Set("Access-Control-Allow-Headers", "*")

	latitude := r.URL.Query().Get("lat")
	latInt, _ := strconv.ParseFloat(latitude, 64)

	longitude := r.URL.Query().Get("lon")
	lonInt, _ := strconv.ParseFloat(longitude, 64)

	if latInt == 0 && lonInt == 0 {
		writeRespose(w, http.StatusOK, true, "")
		return
	}

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
		writeRespose(w, http.StatusBadRequest, nil, err.Error())
		return
	}

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

	data := map[string]interface{}{
		"lat":     location.Lat,
		"lon":     location.Lon,
		"address": strings.Join(address, ", "),
	}

	writeRespose(w, http.StatusOK, data, "")
}

func writeRespose(w http.ResponseWriter, statusCode int, resp interface{}, errMessage string) {
	w.Header().Set("Content-type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status_code":   statusCode,
		"data":          resp,
		"error_message": errMessage,
	})
}
