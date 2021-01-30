package ws

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/go-resty/resty/v2"
)

// GetCoordinateByLocation do get coordinate by location details
func GetCoordinateByLocation(w http.ResponseWriter, r *http.Request) {

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

	// parse and verify location
	location := r.URL.Query().Get("location")
	fmt.Println("location", location)
	if location == "" {
		writeRespose(w, http.StatusOK, map[string]interface{}{"lat": 0, "lon": 0}, "")
		return
	}

	// dispatch query to open street map geocoding api
	resp, err := resty.New().R().
		SetQueryParams(map[string]string{
			"format": "json",
			"q":      location,
			"limit":  "1",
		}).
		Get("https://nominatim.openstreetmap.org/")
	if err != nil {
		writeRespose(w, http.StatusInternalServerError, nil, err.Error())
		return
	}
	if resp.IsError() {
		writeRespose(w, http.StatusInternalServerError, nil, fmt.Sprintf("%v", resp.Error()))
		return
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
		writeRespose(w, http.StatusInternalServerError, nil, err.Error())
		return
	}

	if coordinates == nil {
		writeRespose(w, http.StatusInternalServerError, nil, "coordinates not found")
		return
	}
	if len(coordinates) == 0 {
		writeRespose(w, http.StatusInternalServerError, nil, "coordinates not found")
		return
	}

	// write response
	data := map[string]interface{}{
		"lat":      coordinates[0].Lat,
		"lon":      coordinates[0].Lon,
		"location": location,
	}
	writeRespose(w, http.StatusOK, data, "")
}
