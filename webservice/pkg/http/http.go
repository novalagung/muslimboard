package http

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/getsentry/sentry-go"
)

// writeResponse definition
func WriteRespose(ctx context.Context, w http.ResponseWriter, r *http.Request, statusCode int, resp any, err error) {
	namespace := "pkg.http.WriteRespose"
	span := sentry.StartSpan(ctx, namespace)
	defer span.Finish()

	if statusCode == http.StatusOK {
		RenderCacheHeader(ctx, w, r)
	}

	errMessage := ""
	if err != nil {
		errMessage = err.Error()
	}
	w.Header().Set("Content-type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"status_code":   statusCode,
		"data":          resp,
		"error_message": errMessage,
	})
}

func RenderCacheHeader(ctx context.Context, w http.ResponseWriter, r *http.Request) {
	namespace := "pkg.http.RenderCacheHeader"
	span := sentry.StartSpan(ctx, namespace)
	defer span.Finish()

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
