package http

import (
	"encoding/json"
	"net/http"
)

// writeResponse definition
func WriteRespose(w http.ResponseWriter, r *http.Request, statusCode int, resp interface{}, err error) {

	if statusCode == http.StatusOK {
		RenderCacheHeader(w, r)
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

func RenderCacheHeader(w http.ResponseWriter, r *http.Request) {
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
