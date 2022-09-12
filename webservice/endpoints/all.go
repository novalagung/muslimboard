package p

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/go-resty/resty/v2"
)

var restyDebug = false

// =========================================================== ROUTER ===========================================================

// MuslimboardApi do get coordinate by location details
func MuslimboardApi(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "OPTIONS, GET")
	w.Header().Set("Access-Control-Allow-Headers", "*")
	w.Header().Set("Access-Control-Max-Age", "3600")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	if r.Method == http.MethodGet {
		switch r.URL.Query().Get("op") {

		case "ping":
			writeRespose(w, r, http.StatusOK, true, nil)

		case "image":
			HandleImage(w, r)

		case "shalat-schedule-by-coordinate":
			HandleShalatScheduleByCoordinate(w, r)

		case "shalat-schedule-by-location":
			HandleShalatScheduleByLocation(w, r)

		default:
			err := fmt.Errorf("bad request. unrecognized operation")
			writeRespose(w, r, http.StatusBadRequest, nil, err)
		}
	} else {
		err := fmt.Errorf("bad request. unrecognized method")
		writeRespose(w, r, http.StatusBadRequest, nil, err)
	}
}

// =========================================================== HANDLER ===========================================================

func HandleImage(w http.ResponseWriter, r *http.Request) {
	imageUrl, _ := url.QueryUnescape(r.URL.Query().Get("image"))
	if imageUrl == "" {
		err := fmt.Errorf("missing image url")
		writeRespose(w, r, http.StatusBadRequest, nil, err)
		return
	}

	contentType, body, err := getImage(imageUrl, w)
	if body != nil {
		defer body.Close()
	}
	if err != nil {
		writeRespose(w, r, http.StatusBadRequest, nil, err)
		return
	}

	renderCacheHeader(w, r)
	w.Header().Set("Content-type", contentType)

	_, err = io.Copy(w, body)
	if err != nil {
		writeRespose(w, r, http.StatusBadRequest, nil, err)
		return
	}
}

// HandleShalatScheduleByCoordinate is handler of get shalat schedule by coordinate
func HandleShalatScheduleByCoordinate(w http.ResponseWriter, r *http.Request) {

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
		writeRespose(w, r, http.StatusOK, true, nil)
		return
	}

	schedules, err := getShalatScheduleByCoordinate(method, latInt, lonInt, month, year)
	if err != nil {
		writeRespose(w, r, http.StatusInternalServerError, nil, err)
		return
	}

	res := map[string]interface{}{
		"schedules":   schedules,
		"address":     "",
		"countryCode": "id",
	}

	locationRes, err := getLocationByCoordinate(latitude, longitude)
	if err != nil {
		writeRespose(w, r, http.StatusOK, res, nil)
		return
	}

	res["address"] = locationRes["address"]
	res["countryCode"] = locationRes["countryCode"]
	writeRespose(w, r, http.StatusOK, res, nil)
}

// HandleShalatScheduleByLocation is handler of get shalat schedule by location
// for now, immediately use aladhan.com api coz kemenag backend still under development
func HandleShalatScheduleByLocation(w http.ResponseWriter, r *http.Request) {

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
		writeRespose(w, r, http.StatusInternalServerError, nil, err)
		return
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

	schedules, err := getShalatScheduleByCoordinate(method, latitude, longitude, month, year)
	if err != nil {
		writeRespose(w, r, http.StatusInternalServerError, nil, err)
		return
	}

	address := strings.Title(strings.ToLower(fmt.Sprintf("%s, %s", city, province)))
	res := map[string]interface{}{
		"schedules":   schedules,
		"address":     address,
		"countryCode": "id",
	}

	writeRespose(w, r, http.StatusOK, res, nil)
}

// =========================================================== MODEL ===========================================================

func getImage(url string, w http.ResponseWriter) (string, io.ReadCloser, error) {
	response, err := http.Get(url)
	if err != nil {
		return "", nil, err
	}
	if response.StatusCode != 200 {
		return "", nil, errors.New("received non 200 response code")
	}

	contentType := response.Header.Get("Content-type")
	return contentType, response.Body, nil
}

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

// todo
func validateOriginRequest(r *http.Request) error {
	// firefox: moz-extension://b7d90294-f8dc-492e-8564-e3e7e4490aac
	// chrome: chrome-extension://ckeifgmkgeihgmbgcbcngkacnbeplgmj
	// edge: chrome-extension://dfmgmbngjpmbbpgibmdfegilbfckkgli
	return nil
}

// writeResponse definition
func writeRespose(w http.ResponseWriter, r *http.Request, statusCode int, resp interface{}, err error) {

	if statusCode == http.StatusOK {
		renderCacheHeader(w, r)
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

func renderCacheHeader(w http.ResponseWriter, r *http.Request) {
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
