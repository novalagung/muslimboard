package usecase

import (
	"context"
	"fmt"
	"io"
	"strconv"
	"strings"
	"time"

	pkg_common "muslimboard-api.novalagung.com/pkg/common"

	"github.com/hablullah/go-prayer"
	log "github.com/sirupsen/logrus"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
	"muslimboard-api.novalagung.com/repositories/aladhan"
	goprayer "muslimboard-api.novalagung.com/repositories/go-prayer"
	"muslimboard-api.novalagung.com/repositories/openstreetmap"
	"muslimboard-api.novalagung.com/repositories/unsplash"
)

func GetImage(ctx context.Context, imageUrl string) (string, io.ReadCloser, error) {
	return unsplash.GetImage(ctx, imageUrl)
}

// GetShalatScheduleByCoordinate is handler of get shalat schedule by coordinate
func GetShalatScheduleByCoordinate(ctx context.Context, method, latitude, longitude, month, year string) (map[string]any, error) {
	namespace := "handler.GetShalatScheduleByCoordinate"

	// if lat long is invalid, then simply return true
	latInt, _ := strconv.ParseFloat(latitude, 64)
	lonInt, _ := strconv.ParseFloat(longitude, 64)

	var schedulesBackup []prayer.Schedule
	schedules, err := aladhan.GetShalatScheduleByCoordinate(ctx, method, latInt, lonInt, month, year)
	if err != nil {
		log.Errorln(namespace, "getShalatScheduleByCoordinate", err.Error())

		log.Infoln(namespace, "recalculate prayer times using go-prayer")
		schedulesBackup, err = goprayer.CalculatePrayerTimes(latInt, lonInt, time.Now(), prayer.MWL())
		if err != nil {
			log.Errorln(namespace, "getShalatScheduleByCoordinate backup", err.Error())
			return nil, err
		}

		schedules := make([]aladhan.PrayerTimeSchedule, 0)
		for _, each := range schedulesBackup {
			date, _ := time.Parse("2006-01-02", each.Date)
			schedules = append(schedules, aladhan.PrayerTimeSchedule{
				Date: aladhan.PrayerTimeDate{
					Gregorian: aladhan.PrayerTimeDateDetails{Date: date.Format("02-01-2006")},
					Hijri:     aladhan.PrayerTimeDateDetails{Date: ""},
				},
				Timings: aladhan.PrayerTimeTimings{
					Fajr:    each.Fajr.Format("15:04 (MST)"),
					Sunrise: each.Sunrise.Format("15:04 (MST)"),
					Dhuhr:   each.Zuhr.Format("15:04 (MST)"),
					Asr:     each.Asr.Format("15:04 (MST)"),
					Maghrib: each.Maghrib.Format("15:04 (MST)"),
					Isha:    each.Isha.Format("15:04 (MST)"),
				},
			})
		}
	}

	schedulesMap := make([]map[string]any, 0)
	pkg_common.ConvertTo(schedules, &schedulesMap)

	res := map[string]any{
		"schedules":   schedulesMap,
		"address":     "",
		"countryCode": "id",
	}

	locationRes, err := openstreetmap.GetLocationByCoordinate(ctx, latitude, longitude)
	if err != nil {
		log.Errorln(namespace, "getLocationByCoordinate", err.Error())
		res["address"] = fmt.Sprintf("Location %v, %v", latitude, longitude)
		res["countryCode"] = ""
	} else {
		res["address"] = locationRes["address"]
		res["countryCode"] = locationRes["countryCode"]
	}

	return res, nil
}

// GetShalatScheduleByLocation is handler of get shalat schedule by location
// for now, immediately use aladhan.com api coz kemenag backend still under development
func GetShalatScheduleByLocation(ctx context.Context, method, province, city, month, year string) (map[string]any, error) {
	namespace := "handler.GetShalatScheduleByLocation"

	location := fmt.Sprintf("%s,%s", city, province)
	location = strings.ToLower(location)
	location = strings.Replace(location, "d.i. ", "", -1)
	location = strings.Replace(location, "kab. ", "", -1)
	location = strings.Replace(location, "kota ", "", -1)
	location = strings.TrimSpace(location)

	// get coordinate by location
	coordinate, err := openstreetmap.GetCoordinateByLocation(ctx, location)
	if err != nil {
		log.Errorln(namespace, "getCoordinateByLocation", err.Error())
		return nil, err
	}

	// parse result
	latitude, _ := strconv.ParseFloat(coordinate["lat"].(string), 64)
	longitude, _ := strconv.ParseFloat(coordinate["lon"].(string), 64)

	schedules, err := aladhan.GetShalatScheduleByCoordinate(ctx, method, latitude, longitude, month, year)
	if err != nil {
		log.Errorln(namespace, "getShalatScheduleByCoordinate", err.Error())
		return nil, err
	}

	schedulesMap := make([]map[string]any, 0)
	pkg_common.ConvertTo(schedules, &schedulesMap)

	address := cases.Title(language.English).String(strings.ToLower(fmt.Sprintf("%s, %s", city, province)))
	res := map[string]any{
		"schedules":   schedulesMap,
		"address":     address,
		"countryCode": "id",
	}

	return res, nil
}
