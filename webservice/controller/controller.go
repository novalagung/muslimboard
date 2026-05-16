package controller

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/getsentry/sentry-go"
	pkg_http "muslimboard-api.novalagung.com/pkg/http"
	"muslimboard-api.novalagung.com/pkg/logger"
	pkg_redis "muslimboard-api.novalagung.com/pkg/redis"
	"muslimboard-api.novalagung.com/repositories/geonames"
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

func getClientIP(r *http.Request) string {
	if value := r.Header.Get("X-Forwarded-For"); value != "" {
		parts := strings.Split(value, ",")
		return strings.TrimSpace(parts[0])
	}
	if value := r.Header.Get("X-Real-IP"); value != "" {
		return strings.TrimSpace(value)
	}
	return r.RemoteAddr
}

func allowRateLimit(ctx context.Context, key string, limit int64, expiration time.Duration) bool {
	client := pkg_redis.NewRedis()
	count, err := client.Incr(ctx, key).Result()
	if err != nil {
		logger.Log.Errorln("controller.allowRateLimit", "redis.Incr", err)
		return true
	}
	if count == 1 {
		client.Expire(ctx, key, expiration).Err()
	}
	return count <= limit
}

func HandleLocationSearch(ctx context.Context, w http.ResponseWriter, r *http.Request) {
	namespace := "controller.HandleLocationSearch"
	span := sentry.StartSpan(ctx, namespace)
	span.Data = map[string]any{
		"browserID": r.URL.Query().Get("browserID"),
		"query":     r.URL.Query().Get("q"),
		"limit":     r.URL.Query().Get("limit"),
	}
	defer span.Finish()

	browserID := strings.TrimSpace(r.URL.Query().Get("browserID"))
	query := strings.TrimSpace(r.URL.Query().Get("q"))
	limit := geonames.ParseLimit(r.URL.Query().Get("limit"))

	if browserID == "" {
		err := fmt.Errorf("missing browserID")
		pkg_http.WriteRespose(ctx, w, r, http.StatusBadRequest, nil, err)
		return
	}
	if len([]rune(query)) < 3 {
		err := fmt.Errorf("query must contain at least 3 characters")
		pkg_http.WriteRespose(ctx, w, r, http.StatusBadRequest, nil, err)
		return
	}

	ip := getClientIP(r)
	if !allowRateLimit(ctx, "rate:location-search:ip:"+ip, 30, time.Minute) ||
		!allowRateLimit(ctx, "rate:location-search:browser:"+browserID, 300, 24*time.Hour) {
		err := fmt.Errorf("too many location search requests")
		pkg_http.WriteRespose(ctx, w, r, http.StatusTooManyRequests, nil, err)
		return
	}

	res, err := usecase.SearchLocations(ctx, query, limit)
	if err != nil {
		logger.Log.Errorln(namespace, "searchLocations", err)
		pkg_http.WriteRespose(ctx, w, r, http.StatusInternalServerError, nil, err)
		return
	}

	pkg_http.WriteRespose(ctx, w, r, http.StatusOK, res, nil)
}

// HandleShalatScheduleByCoordinate is handler of get shalat schedule by coordinate
func HandleShalatScheduleByCoordinate(ctx context.Context, w http.ResponseWriter, r *http.Request) {
	namespace := "controller.HandleShalatScheduleByCoordinate"
	span := sentry.StartSpan(ctx, namespace)
	span.Data = map[string]any{
		"browserID": r.URL.Query().Get("browserID"),
		"month":     r.URL.Query().Get("month"),
		"year":      r.URL.Query().Get("year"),
		"latitude":  r.URL.Query().Get("latitude"),
		"longitude": r.URL.Query().Get("longitude"),
	}
	defer span.Finish()

	// parse params
	browserID := r.URL.Query().Get("browserID")
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
	res, err := usecase.GetShalatScheduleByCoordinate(ctx, browserID, method, latitude, longitude, month, year)
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
		"browserID": r.URL.Query().Get("browserID"),
		"month":     r.URL.Query().Get("month"),
		"year":      r.URL.Query().Get("year"),
		"province":  r.URL.Query().Get("province"),
		"city":      r.URL.Query().Get("city"),
	}
	defer span.Finish()

	// parse params
	browserID := r.URL.Query().Get("browserID")
	method := "11" // Majlis Ugama Islam Singapura, Singapore
	month := r.URL.Query().Get("month")
	year := r.URL.Query().Get("year")
	province := r.URL.Query().Get("province")
	city := r.URL.Query().Get("city")

	// get data
	res, err := usecase.GetShalatScheduleByLocation(ctx, browserID, method, province, city, month, year)
	if err != nil {
		logger.Log.Errorln(namespace, "getShalatScheduleByLocation", err)
		pkg_http.WriteRespose(ctx, w, r, http.StatusInternalServerError, nil, err)
		return
	}

	pkg_http.WriteRespose(ctx, w, r, http.StatusOK, res, nil)
}
