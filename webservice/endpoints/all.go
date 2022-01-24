package p

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-resty/resty/v2"
)

// MuslimboardApi do get coordinate by location details
func MuslimboardApi(w http.ResponseWriter, r *http.Request) {

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

	if r.Method == "GET" {
		switch r.URL.Query().Get("op") {
		case "coordinate-by-location":
			getCoordinateByLocation(w, r)
		case "location-by-coordinate":
			getLocationByCoordinate(w, r)
		case "shalat-schedule-by-coordinate":
			getShalatScheduleByCoordinate(w, r)
		case "shalat-schedule-by-location":
			getShalatScheduleByLocation(w, r)
		default:
			w.WriteHeader(http.StatusOK)
		}
	} else {
		w.WriteHeader(http.StatusOK)
	}
}

func writeRespose(w http.ResponseWriter, statusCode int, resp interface{}, errMessage string) {
	w.Header().Set("Content-type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status_code":   statusCode,
		"data":          resp,
		"error_message": errMessage,
	})
}

// getCoordinateByLocation do get coordinate by location details
func getCoordinateByLocation(w http.ResponseWriter, r *http.Request) {

	// parse and verify location
	location := r.URL.Query().Get("location")
	location = strings.ToLower(location)
	location = strings.Replace(location, "d.i. ", "", -1)
	location = strings.Replace(location, "kab. ", "", -1)
	location = strings.Replace(location, "kota ", "", -1)

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

// getLocationByCoordinate do get location details by coordinate
func getLocationByCoordinate(w http.ResponseWriter, r *http.Request) {

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

// getShalatScheduleByCoordinate do get location details by coordinate
func getShalatScheduleByCoordinate(w http.ResponseWriter, r *http.Request) {

	// parse lat long
	method := r.URL.Query().Get("method")
	latitude, _ := strconv.ParseFloat(r.URL.Query().Get("latitude"), 64)
	longitude, _ := strconv.ParseFloat(r.URL.Query().Get("longitude"), 64)
	month := r.URL.Query().Get("month")
	year := r.URL.Query().Get("year")

	// if lat long is invalid, then simply return true
	if latitude == 0 && longitude == 0 {
		writeRespose(w, http.StatusOK, true, "")
		return
	}

	// dispatch query to open street map geocoding api
	resp, err := resty.New().SetDebug(true).R().
		SetQueryParams(map[string]string{
			"method":    method,
			"latitude":  fmt.Sprintf("%v", latitude),
			"longitude": fmt.Sprintf("%v", longitude),
			"month":     month,
			"year":      year,
		}).
		Get("http://api.aladhan.com/v1/calendar")
	if err != nil {
		writeRespose(w, http.StatusInternalServerError, nil, err.Error())
		return
	}
	if resp.IsError() {
		writeRespose(w, http.StatusInternalServerError, nil, fmt.Sprintf("%v", resp.Error()))
		return
	}

	// parse response
	res := struct {
		Code   int
		Data   []map[string]interface{}
		Status string
	}{}
	err = json.Unmarshal(resp.Body(), &res)
	if err != nil {
		writeRespose(w, http.StatusInternalServerError, nil, err.Error())
		return
	}
	if res.Code != 200 {
		writeRespose(w, http.StatusInternalServerError, nil, fmt.Sprintf("%v", res.Status))
		return
	}

	writeRespose(w, http.StatusOK, res.Data, "")
}

// getShalatScheduleByLocation do get location details by coordinate
func getShalatScheduleByLocation(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("under development"))
	w.WriteHeader(http.StatusNotImplemented)
}
