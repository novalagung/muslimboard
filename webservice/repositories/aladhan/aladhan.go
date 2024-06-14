package aladhan

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"github.com/go-resty/resty/v2"
	log "github.com/sirupsen/logrus"
	"muslimboard-api.novalagung.com/models"
)

// GetShalatScheduleByCoordinate do get shalat schedule by coordinate
func GetShalatScheduleByCoordinate(ctx context.Context, method string, latitude, longitude float64, month, year string) ([]map[string]interface{}, error) {
	logNamespace := "repositories.aladhan.GetShalatScheduleByCoordinate"

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
		log.Errorln(logNamespace, "resty.Get", err.Error())
		return nil, err
	}
	if resp.IsError() {
		err = fmt.Errorf("%v", resp.Error())
		log.Errorln(logNamespace, "resp.IsError", err.Error())
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
		log.Errorln(logNamespace, "json.Unmarshal", err.Error())
		return nil, err
	}
	if schedules.Code != 200 {
		err = fmt.Errorf("%v", schedules.Status)
		log.Errorln(logNamespace, "schedules.Code != 200", err.Error())
		return nil, err
	}

	return schedules.Data, nil
}
