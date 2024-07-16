package aladhan

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"github.com/getsentry/sentry-go"
	"github.com/go-resty/resty/v2"
	"muslimboard-api.novalagung.com/models"
	pkg_common "muslimboard-api.novalagung.com/pkg/common"
	"muslimboard-api.novalagung.com/pkg/logger"
	pkg_redis "muslimboard-api.novalagung.com/pkg/redis"
)

// GetShalatScheduleByCoordinate do get shalat schedule by coordinate
func GetShalatScheduleByCoordinate(ctx context.Context, method string, latitude, longitude float64, month, year string) ([]PrayerTimeSchedule, error) {
	namespace := "repositories.aladhan.GetShalatScheduleByCoordinate"
	span := sentry.StartSpan(ctx, namespace)
	defer span.Finish()

	// check cache
	cacheKey := fmt.Sprintf("%v %v %v %v %v %v", namespace, method, latitude, longitude, month, year)
	cachedRes, err := pkg_redis.NewRedis().Get(ctx, cacheKey).Result()
	if err == nil {
		cachedResData := make([]PrayerTimeSchedule, 0)
		err = pkg_common.ConvertTo(cachedRes, &cachedResData)
		if len(cachedResData) > 0 && err == nil {
			// prolong the cache expiration date
			pkg_redis.NewRedis().Set(ctx, cacheKey, cachedRes, models.RedisKeepAliveDuration).Err()
			logger.Log.Debugln(namespace, "load from cache", cacheKey)
			return cachedResData, nil
		}
	}

	ctxr, cancel := context.WithTimeout(context.TODO(), models.ApiCallTimeoutDuration)
	defer cancel()

	// dispatch query to open street map geocoding api
	resp, err := resty.New().
		SetDebug(os.Getenv("DEBUG") == "true").
		R().
		SetContext(ctxr).
		SetHeader("User-Agent", models.UserAgent).
		SetQueryParams(map[string]string{
			"method":    method,
			"latitude":  fmt.Sprintf("%v", latitude),
			"longitude": fmt.Sprintf("%v", longitude),
			"month":     month,
			"year":      year,
		}).
		Get("http://api.aladhan.com/v1/calendar")
	if err != nil {
		logger.Log.Errorln(namespace, "resty.Get", err.Error())
		return nil, err
	}
	if resp.IsError() {
		err = fmt.Errorf("%v", resp.Error())
		logger.Log.Errorln(namespace, "resp.IsError", err.Error())
		return nil, err
	}

	// parse response
	schedules := PrayerTime{}
	err = json.Unmarshal(resp.Body(), &schedules)
	if err != nil {
		logger.Log.Errorln(namespace, "json.Unmarshal", err.Error())
		return nil, err
	}
	if schedules.Code != 200 {
		err = fmt.Errorf("%v", schedules.Status)
		logger.Log.Errorln(namespace, "schedules.Code != 200", err.Error())
		return nil, err
	}

	// store cache
	logger.Log.Debugln(namespace, "set cache", cacheKey)
	pkg_redis.NewRedis().Set(ctx, cacheKey, pkg_common.ConvertToJsonString(schedules.Data), models.RedisKeepAliveDuration).Err()

	return schedules.Data, nil
}
