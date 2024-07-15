package aladhan

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"github.com/go-resty/resty/v2"
	"muslimboard-api.novalagung.com/models"
	"muslimboard-api.novalagung.com/pkg/logger"
)

// GetShalatScheduleByCoordinate do get shalat schedule by coordinate
func GetShalatScheduleByCoordinate(ctx context.Context, method string, latitude, longitude float64, month, year string) ([]PrayerTimeSchedule, error) {
	namespace := "repositories.aladhan.GetShalatScheduleByCoordinate"

	// dispatch query to open street map geocoding api
	resp, err := resty.New().
		SetDebug(os.Getenv("DEBUG") == "true").
		R().
		SetContext(ctx).
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

	return schedules.Data, nil
}
