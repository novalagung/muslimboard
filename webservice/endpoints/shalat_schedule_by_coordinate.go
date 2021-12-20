package ws

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/go-resty/resty/v2"
)

// GetLocationByCoordinate do get location details by coordinate
func GetShalatScheduleByCoordinate(w http.ResponseWriter, r *http.Request) {

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
