package p

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-resty/resty/v2"
)

var restyDebug = false

// =========================================================== ROUTER ===========================================================

// MuslimboardApi do get coordinate by location details
func MuslimboardApi(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Max-Age", "3600")
		w.WriteHeader(http.StatusNoContent)
		return
	}

	w.Header().Set("Access-Control-Allow-Origin", "*")

	var res interface{}
	var err error
	if r.Method == "GET" {
		switch r.URL.Query().Get("op") {

		// will be deprecated later
		case "coordinate-by-location":
			res, err = HandleCoordinateByLocation(w, r)

		// will be deprecated later
		case "location-by-coordinate":
			res, err = HandleLocationByCoordinate(w, r)

		case "ping":
			res = true

		case "shalat-schedule-by-coordinate":
			res, err = HandleShalatScheduleByCoordinate(w, r)

		case "shalat-schedule-by-location":
			res, err = HandleShalatScheduleByLocation(w, r)

		default:
			err = fmt.Errorf("bad request. unrecognized operation")
		}
	} else {
		err = fmt.Errorf("bad request. unrecognized method")
	}

	if err != nil {
		writeRespose(w, r, http.StatusInternalServerError, nil, err)
		return
	}
	writeRespose(w, r, http.StatusOK, res, err)
}

// =========================================================== HANDLER ===========================================================

// HandleCoordinateByLocation is handler of get coordinate by location details
func HandleCoordinateByLocation(w http.ResponseWriter, r *http.Request) (interface{}, error) {

	// parse params and verify location
	location := r.URL.Query().Get("location")
	location = strings.ToLower(location)
	location = strings.Replace(location, "d.i. ", "", -1)
	location = strings.Replace(location, "kab. ", "", -1)
	location = strings.Replace(location, "kota ", "", -1)
	location = strings.TrimSpace(location)

	// validate location
	if location == "" {
		res := map[string]interface{}{"lat": 0, "lon": 0}
		return res, nil
	}

	return getCoordinateByLocation(location)
}

// HandleLocationByCoordinate is handler of get location details by coordinate
func HandleLocationByCoordinate(w http.ResponseWriter, r *http.Request) (interface{}, error) {

	// parse params
	latitude := r.URL.Query().Get("lat")
	longitude := r.URL.Query().Get("lon")

	// parse coordinate
	latInt, _ := strconv.ParseFloat(latitude, 64)
	lonInt, _ := strconv.ParseFloat(longitude, 64)

	// if lat long is invalid, then simply return true
	if latInt == 0 && lonInt == 0 {
		return true, nil
	}

	return getLocationByCoordinate(latitude, longitude)
}

// HandleShalatScheduleByCoordinate is handler of get shalat schedule by coordinate
func HandleShalatScheduleByCoordinate(w http.ResponseWriter, r *http.Request) (interface{}, error) {

	// parse params
	method := r.URL.Query().Get("method")
	if method == "" {
		method = "1"
	}
	latitude := r.URL.Query().Get("latitude")
	longitude := r.URL.Query().Get("longitude")
	month := r.URL.Query().Get("month")
	year := r.URL.Query().Get("year")

	// if lat long is invalid, then simply return true
	latInt, _ := strconv.ParseFloat(latitude, 64)
	lonInt, _ := strconv.ParseFloat(longitude, 64)
	if latInt == 0 && lonInt == 0 {
		return true, nil
	}

	schedules, err := getShalatScheduleByCoordinate(method, latInt, lonInt, month, year)
	if err != nil {
		return nil, err
	}

	res := map[string]interface{}{
		"schedules": schedules,
		"address":   "",
	}

	locationRes, err := getLocationByCoordinate(latitude, longitude)
	if err != nil {
		return res, nil
	}

	res["address"] = locationRes["address"]
	return res, nil
}

// HandleShalatScheduleByLocation is handler of get shalat schedule by location
// for now, immediately use aladhan.com api coz kemenag backend still under development
func HandleShalatScheduleByLocation(w http.ResponseWriter, r *http.Request) (interface{}, error) {

	province := r.URL.Query().Get("province")
	city := r.URL.Query().Get("city")

	location := fmt.Sprintf("%s,%s", city, province)
	location = strings.ToLower(location)
	location = strings.Replace(location, "d.i. ", "", -1)
	location = strings.Replace(location, "kab. ", "", -1)
	location = strings.Replace(location, "kota ", "", -1)
	location = strings.TrimSpace(location)

	// get coordinate by location
	coordinate, err := getCoordinateByLocation(location)
	if err != nil {
		return nil, err
	}

	// parse params
	method := r.URL.Query().Get("method")
	if method == "" {
		method = "1"
	}
	month := r.URL.Query().Get("month")
	year := r.URL.Query().Get("year")

	// parse result
	latitude, _ := strconv.ParseFloat(coordinate["lat"].(string), 64)
	longitude, _ := strconv.ParseFloat(coordinate["lon"].(string), 64)
	// for now hardcode the contry to Indonesia

	schedules, err := getShalatScheduleByCoordinate(method, latitude, longitude, month, year)
	if err != nil {
		return nil, err
	}

	address := strings.Title(strings.ToLower(fmt.Sprintf("%s, %s", city, province)))
	res := map[string]interface{}{
		"schedules": schedules,
		"address":   address,
	}

	return res, nil
}

// =========================================================== MODEL ===========================================================

// getCoordinateByLocation do get coordinate by location details
func getCoordinateByLocation(location string) (map[string]interface{}, error) {

	// dispatch query to open street map geocoding api
	resp, err := resty.New().
		SetDebug(restyDebug).
		R().
		SetQueryParams(map[string]string{
			"format": "json",
			"q":      location,
			"limit":  "1",
		}).
		Get("https://nominatim.openstreetmap.org/")
	if err != nil {
		return nil, err
	}
	if resp.IsError() {
		err = fmt.Errorf("%v", resp.Error())
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
		return nil, err
	}

	if coordinates == nil {
		err = fmt.Errorf("coordinates not found")
		return nil, err
	}
	if len(coordinates) == 0 {
		err = fmt.Errorf("coordinates not found")
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

// getLocationByCoordinate do get location details by coordinate
func getLocationByCoordinate(latitude, longitude string) (map[string]interface{}, error) {

	// dispatch query to open street map geocoding api
	resp, err := resty.New().
		SetDebug(restyDebug).
		R().
		SetQueryParams(map[string]string{
			"format": "json",
			"lat":    latitude,
			"lon":    longitude,
		}).
		Get("https://nominatim.openstreetmap.org/reverse")
	if err != nil {
		return nil, err
	}
	if resp.IsError() {
		err = fmt.Errorf("%v", resp.Error())
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
		return nil, err
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
	return data, nil
}

// getShalatScheduleByCoordinate do get shalat schedule by coordinate
func getShalatScheduleByCoordinate(method string, latitude, longitude float64, month, year string) ([]map[string]interface{}, error) {

	// dispatch query to open street map geocoding api
	resp, err := resty.New().
		SetDebug(restyDebug).
		R().
		SetQueryParams(map[string]string{
			"method":    method,
			"latitude":  fmt.Sprintf("%v", latitude),
			"longitude": fmt.Sprintf("%v", longitude),
			"month":     month,
			"year":      year,
		}).
		Get("http://api.aladhan.com/v1/calendar")
	if err != nil {
		return nil, err
	}
	if resp.IsError() {
		err = fmt.Errorf("%v", resp.Error())
		return nil, err
	}

	// parse response
	schedules := struct {
		Code   int
		Data   []map[string]interface{}
		Status string
	}{}
	err = json.Unmarshal(resp.Body(), &schedules)
	if err != nil {
		return nil, err
	}
	if schedules.Code != 200 {
		err = fmt.Errorf("%v", schedules.Status)
		return nil, err
	}

	return schedules.Data, nil
}

// =========================================================== UTILITY ===========================================================

// writeResponse definition
func writeRespose(w http.ResponseWriter, r *http.Request, statusCode int, resp interface{}, err error) {

	if statusCode == http.StatusOK {

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
	}

	errMessage := ""
	if err != nil {
		errMessage = err.Error()
	}
	w.Header().Set("Content-type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status_code":   statusCode,
		"data":          resp,
		"error_message": errMessage,
	})
}
