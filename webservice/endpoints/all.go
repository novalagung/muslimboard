package p

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/go-resty/resty/v2"
	"github.com/redis/go-redis/v9"
	log "github.com/sirupsen/logrus"
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
		switch op := r.URL.Query().Get("op"); op {

		case "ping":
			writeRespose(w, r, http.StatusOK, true, nil)

		case "image":
			log.Infoln("MuslimboardApi", "incoming request", "op="+op, r.URL.String())
			HandleImage(w, r)

		case "shalat-schedule-by-coordinate":
			log.Infoln("MuslimboardApi", "incoming request", "op="+op, r.URL.String())
			HandleShalatScheduleByCoordinate(w, r)

		case "shalat-schedule-by-location":
			log.Infoln("MuslimboardApi", "incoming request", "op="+op, r.URL.String())
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

	// handler ctx
	ctx := context.Background()

	imageUrl, _ := url.QueryUnescape(r.URL.Query().Get("image"))
	if imageUrl == "" {
		err := fmt.Errorf("missing image url")
		log.Errorln("HandleImage", "queryUnescape", err.Error())
		writeRespose(w, r, http.StatusBadRequest, nil, err)
		return
	}

	contentType, body, err := getImage(ctx, imageUrl, w)
	if body != nil {
		defer body.Close()
	}
	if err != nil {
		log.Errorln("HandleImage", "getImage", err.Error())
		writeRespose(w, r, http.StatusBadRequest, nil, err)
		return
	}

	renderCacheHeader(w, r)
	w.Header().Set("Content-type", contentType)

	_, err = io.Copy(w, body)
	if err != nil {
		log.Errorln("HandleImage", "io.Copy", err.Error())
		writeRespose(w, r, http.StatusBadRequest, nil, err)
		return
	}
}

// HandleShalatScheduleByCoordinate is handler of get shalat schedule by coordinate
func HandleShalatScheduleByCoordinate(w http.ResponseWriter, r *http.Request) {

	// handler ctx
	ctx := context.Background()

	// check cache
	cachedRes, err := newRedis().Get(ctx, r.URL.String()).Result()
	if err != nil {
		log.Warningln("HandleShalatScheduleByCoordinate", "newRedis().Get", err.Error())
	} else {
		cachedResMap, err := convertToMap(cachedRes)
		if len(cachedResMap) > 0 && err == nil {
			log.Infoln("HandleShalatScheduleByCoordinate", "load from cache", r.URL.String())
			writeRespose(w, r, http.StatusOK, cachedResMap, nil)
			return
		}
	}

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

	schedules, err := getShalatScheduleByCoordinate(ctx, method, latInt, lonInt, month, year)
	if err != nil {
		log.Errorln("HandleShalatScheduleByCoordinate", "getShalatScheduleByCoordinate", err.Error())
		writeRespose(w, r, http.StatusInternalServerError, nil, err)
		return
	}

	res := map[string]interface{}{
		"schedules":   schedules,
		"address":     "",
		"countryCode": "id",
	}

	locationRes, err := getLocationByCoordinate(ctx, latitude, longitude)
	if err != nil {
		log.Errorln("HandleShalatScheduleByCoordinate", "getLocationByCoordinate", err.Error())
		writeRespose(w, r, http.StatusOK, res, nil)
		return
	}

	res["address"] = locationRes["address"]
	res["countryCode"] = locationRes["countryCode"]

	// cache response
	err = newRedis().Set(ctx, r.URL.String(), convertToJson(res), time.Hour*24*10).Err()
	if err != nil {
		log.Warningln("HandleShalatScheduleByCoordinate", "newRedis().Set", err.Error())
	}

	writeRespose(w, r, http.StatusOK, res, nil)
}

// HandleShalatScheduleByLocation is handler of get shalat schedule by location
// for now, immediately use aladhan.com api coz kemenag backend still under development
func HandleShalatScheduleByLocation(w http.ResponseWriter, r *http.Request) {

	// handler ctx
	ctx := context.Background()

	// check cache
	cachedRes, err := newRedis().Get(ctx, r.URL.String()).Result()
	if err != nil {
		log.Warningln("HandleShalatScheduleByLocation", "newRedis().Get", err.Error())
	} else {
		cachedResMap, err := convertToMap(cachedRes)
		if len(cachedResMap) > 0 && err == nil {
			log.Infoln("HandleShalatScheduleByLocation", "load from cache", r.URL.String())
			writeRespose(w, r, http.StatusOK, cachedResMap, nil)
			return
		}
	}

	province := r.URL.Query().Get("province")
	city := r.URL.Query().Get("city")

	location := fmt.Sprintf("%s,%s", city, province)
	location = strings.ToLower(location)
	location = strings.Replace(location, "d.i. ", "", -1)
	location = strings.Replace(location, "kab. ", "", -1)
	location = strings.Replace(location, "kota ", "", -1)
	location = strings.TrimSpace(location)

	// get coordinate by location
	coordinate, err := getCoordinateByLocation(ctx, location)
	if err != nil {
		log.Errorln("HandleShalatScheduleByLocation", "getCoordinateByLocation", err.Error())
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

	schedules, err := getShalatScheduleByCoordinate(ctx, method, latitude, longitude, month, year)
	if err != nil {
		log.Errorln("HandleShalatScheduleByLocation", "getShalatScheduleByCoordinate", err.Error())
		writeRespose(w, r, http.StatusInternalServerError, nil, err)
		return
	}

	address := strings.Title(strings.ToLower(fmt.Sprintf("%s, %s", city, province)))
	res := map[string]interface{}{
		"schedules":   schedules,
		"address":     address,
		"countryCode": "id",
	}

	// cache response
	err = newRedis().Set(ctx, r.URL.String(), convertToJson(res), time.Hour*24*10).Err()
	if err != nil {
		log.Warningln("HandleShalatScheduleByLocation", "newRedis().Set", err.Error())
	}

	writeRespose(w, r, http.StatusOK, res, nil)
}

// =========================================================== MODEL ===========================================================

func getImage(ctx context.Context, url string, w http.ResponseWriter) (string, io.ReadCloser, error) {
	response, err := http.Get(url)
	if err != nil {
		log.Errorln("getImage", "http.Get", err.Error())
		return "", nil, err
	}
	if response.StatusCode != 200 {
		err = errors.New("received non 200 response code")
		log.Errorln("getImage", "response.StatusCode", err.Error())
		return "", nil, err
	}

	contentType := response.Header.Get("Content-type")
	return contentType, response.Body, nil
}

// getCoordinateByLocation do get coordinate by location details
func getCoordinateByLocation(ctx context.Context, location string) (map[string]interface{}, error) {

	// dispatch query to open street map geocoding api
	resp, err := resty.New().
		SetDebug(restyDebug).
		R().
		SetContext(ctx).
		SetQueryParams(map[string]string{
			"format": "json",
			"q":      location,
			"limit":  "1",
		}).
		Get("https://nominatim.openstreetmap.org/")
	if err != nil {
		log.Errorln("getCoordinateByLocation", "resty.Get", err.Error())
		return nil, err
	}
	if resp.IsError() {
		err = fmt.Errorf("%v", resp.Error())
		log.Errorln("getCoordinateByLocation", "resp.IsError", err.Error())
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
		log.Errorln("getCoordinateByLocation", "json.Unmarshal", err.Error())
		return nil, err
	}

	if coordinates == nil {
		err = fmt.Errorf("coordinates not found")
		log.Errorln("getCoordinateByLocation", "coordinates", err.Error())
		return nil, err
	}
	if len(coordinates) == 0 {
		err = fmt.Errorf("coordinates not found")
		log.Errorln("getCoordinateByLocation", "len(coordinates) == 0", err.Error())
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
func getLocationByCoordinate(ctx context.Context, latitude, longitude string) (map[string]interface{}, error) {

	// dispatch query to open street map geocoding api
	resp, err := resty.New().
		SetDebug(restyDebug).
		R().
		SetContext(ctx).
		SetQueryParams(map[string]string{
			"format": "json",
			"lat":    latitude,
			"lon":    longitude,
		}).
		Get("https://nominatim.openstreetmap.org/reverse")
	if err != nil {
		log.Errorln("getLocationByCoordinate", "resty.Get", err.Error())
		return nil, err
	}
	if resp.IsError() {
		err = fmt.Errorf("%v", resp.Error())
		log.Errorln("getLocationByCoordinate", "resp.IsError", err.Error())
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
		log.Errorln("getLocationByCoordinate", "json.Unmarshal", err.Error())
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
func getShalatScheduleByCoordinate(ctx context.Context, method string, latitude, longitude float64, month, year string) ([]map[string]interface{}, error) {

	// dispatch query to open street map geocoding api
	resp, err := resty.New().
		SetDebug(restyDebug).
		R().
		SetContext(ctx).
		SetQueryParams(map[string]string{
			"method":    method,
			"latitude":  fmt.Sprintf("%v", latitude),
			"longitude": fmt.Sprintf("%v", longitude),
			"month":     month,
			"year":      year,
		}).
		Get("http://api.aladhan.com/v1/calendar")
	if err != nil {
		log.Errorln("getShalatScheduleByCoordinate", "resty.Get", err.Error())
		return nil, err
	}
	if resp.IsError() {
		err = fmt.Errorf("%v", resp.Error())
		log.Errorln("getShalatScheduleByCoordinate", "resp.IsError", err.Error())
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
		log.Errorln("getShalatScheduleByCoordinate", "json.Unmarshal", err.Error())
		return nil, err
	}
	if schedules.Code != 200 {
		err = fmt.Errorf("%v", schedules.Status)
		log.Errorln("getShalatScheduleByCoordinate", "schedules.Code != 200", err.Error())
		return nil, err
	}

	return schedules.Data, nil
}

// =========================================================== UTILITY ===========================================================

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

func newRedis() *redis.Client {
	return redis.NewClient(&redis.Options{
		Addr:     "muslimboard-redis:6379",
		Password: "",
		DB:       0,
	})
}

func convertToJson(src interface{}) string {
	buf, _ := json.Marshal(src)
	return string(buf)
}

func convertToMap(src string) (map[string]interface{}, error) {
	res := make(map[string]interface{})
	err := json.Unmarshal([]byte(src), &res)
	return res, err
}
