package controller

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"

	"github.com/getsentry/sentry-go"
	pkg_http "muslimboard-api.novalagung.com/pkg/http"
	"muslimboard-api.novalagung.com/pkg/logger"
	"muslimboard-api.novalagung.com/usecase"
)

func HandleImage(ctx context.Context, w http.ResponseWriter, r *http.Request) {
	namespace := "controller.HandleImage"
	span := sentry.StartSpan(ctx, namespace)
	span.Data = map[string]any{
		"image": r.URL.Query().Get("image"),
	}
	defer span.Finish()

	imageUrl, _ := url.QueryUnescape(r.URL.Query().Get("image"))
	if imageUrl == "" {
		err := fmt.Errorf("missing image url")
		logger.Log.Errorln(namespace, "queryUnescape", err)
		pkg_http.WriteRespose(ctx, w, r, http.StatusBadRequest, nil, err)
		return
	}

	contentType, body, err := usecase.GetImage(ctx, imageUrl)
	if body != nil {
		defer body.Close()
	}
	if err != nil {
		logger.Log.Errorln(namespace, "getImage", err)
		pkg_http.WriteRespose(ctx, w, r, http.StatusBadRequest, nil, err)
		return
	}

	pkg_http.RenderCacheHeader(ctx, w, r)
	w.Header().Set("Content-type", contentType)

	_, err = io.Copy(w, body)
	if err != nil {
		logger.Log.Errorln(namespace, "io.Copy", err)
		pkg_http.WriteRespose(ctx, w, r, http.StatusBadRequest, nil, err)
		return
	}
}

// HandleShalatScheduleByCoordinate is handler of get shalat schedule by coordinate
func HandleShalatScheduleByCoordinate(ctx context.Context, w http.ResponseWriter, r *http.Request) {
	namespace := "controller.HandleShalatScheduleByCoordinate"
	span := sentry.StartSpan(ctx, namespace)
	span.Data = map[string]any{
		"month":     r.URL.Query().Get("month"),
		"year":      r.URL.Query().Get("year"),
		"latitude":  r.URL.Query().Get("latitude"),
		"longitude": r.URL.Query().Get("longitude"),
	}
	defer span.Finish()

	// parse params
	method := "3" // Muslim World League
	month := r.URL.Query().Get("month")
	year := r.URL.Query().Get("year")
	latitude := r.URL.Query().Get("latitude")
	longitude := r.URL.Query().Get("longitude")

	// if lat long is invalid, then simply return true
	latInt, _ := strconv.ParseFloat(latitude, 64)
	lonInt, _ := strconv.ParseFloat(longitude, 64)
	if latInt == 0 && lonInt == 0 {
		pkg_http.WriteRespose(ctx, w, r, http.StatusOK, true, nil)
		return
	}

	// get data
	res, err := usecase.GetShalatScheduleByCoordinate(ctx, method, latitude, longitude, month, year)
	if err != nil {
		logger.Log.Errorln(namespace, "getShalatScheduleByCoordinate", err)
		pkg_http.WriteRespose(ctx, w, r, http.StatusInternalServerError, nil, err)
		return
	}

	pkg_http.WriteRespose(ctx, w, r, http.StatusOK, res, nil)
}

// HandleShalatScheduleByLocation is handler of get shalat schedule by location
// for now, immediately use aladhan.com api coz kemenag backend still under development
func HandleShalatScheduleByLocation(ctx context.Context, w http.ResponseWriter, r *http.Request) {
	namespace := "controller.HandleShalatScheduleByLocation"
	span := sentry.StartSpan(ctx, namespace)
	span.Data = map[string]any{
		"month":    r.URL.Query().Get("month"),
		"year":     r.URL.Query().Get("year"),
		"province": r.URL.Query().Get("province"),
		"city":     r.URL.Query().Get("city"),
	}
	defer span.Finish()

	// parse params
	method := "11" // Majlis Ugama Islam Singapura, Singapore
	month := r.URL.Query().Get("month")
	year := r.URL.Query().Get("year")
	province := r.URL.Query().Get("province")
	city := r.URL.Query().Get("city")

	// get data
	res, err := usecase.GetShalatScheduleByLocation(ctx, method, province, city, month, year)
	if err != nil {
		logger.Log.Errorln(namespace, "getShalatScheduleByLocation", err)
		pkg_http.WriteRespose(ctx, w, r, http.StatusInternalServerError, nil, err)
		return
	}

	pkg_http.WriteRespose(ctx, w, r, http.StatusOK, res, nil)
}
