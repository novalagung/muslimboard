package usecase

import (
	"context"
	"fmt"
	"io"
	"os"
	"strconv"
	"strings"
	"time"

	pkg_common "muslimboard-api.novalagung.com/pkg/common"
	"muslimboard-api.novalagung.com/pkg/logger"

	"github.com/getsentry/sentry-go"
	"github.com/hablullah/go-prayer"
	"github.com/ugjka/go-tz/v2"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
	"muslimboard-api.novalagung.com/repositories/aladhan"
	"muslimboard-api.novalagung.com/repositories/cache"
	"muslimboard-api.novalagung.com/repositories/geonames"
	goprayer "muslimboard-api.novalagung.com/repositories/go-prayer"
	"muslimboard-api.novalagung.com/repositories/openstreetmap"
	"muslimboard-api.novalagung.com/repositories/unsplash"
)

// Cache manager instance (could be injected via dependency injection in a more complex setup)
var cacheManager = cache.NewCacheManager()

func GetImage(ctx context.Context, imageUrl string) (string, io.ReadCloser, error) {
	return unsplash.GetImage(ctx, imageUrl)
}

func SearchLocations(ctx context.Context, query string, limit int) ([]geonames.Location, error) {
	return geonames.SearchLocations(ctx, query, limit)
}

func normalizeAladhanMethod(raw, fallback string) string {
	method := strings.TrimSpace(raw)
	if method == "" {
		return fallback
	}
	allowed := map[string]bool{
		"1": true, "2": true, "3": true, "4": true,
		"5": true, "7": true, "8": true, "9": true, "10": true,
		"11": true, "12": true, "13": true, "14": true, "15": true,
		"16": true, "17": true, "18": true, "19": true, "20": true,
		"21": true, "22": true, "23": true, "99": true,
	}
	if allowed[method] {
		return method
	}
	return fallback
}

func normalizeFallbackMethod(raw, fallback string) *prayer.TwilightConvention {
	method := strings.ToUpper(strings.TrimSpace(raw))
	if method == "" {
		method = strings.ToUpper(strings.TrimSpace(fallback))
	}
	methodMapping := map[string]func() *prayer.TwilightConvention{
		"ASTRONOMICAL": prayer.AstronomicalTwilight,
		"MWL":          prayer.MWL,
		"ISNA":         prayer.ISNA,
		"UMMALQURA":    prayer.UmmAlQura,
		"GULF":         prayer.Gulf,
		"ALGERIAN":     prayer.Algerian,
		"KARACHI":      prayer.Karachi,
		"DIYANET":      prayer.Diyanet,
		"EGYPT":        prayer.Egypt,
		"EGYPTBIS":     prayer.EgyptBis,
		"KEMENAG":      prayer.Kemenag,
		"MUIS":         prayer.MUIS,
		"JAKIM":        prayer.JAKIM,
		"UOIF":         prayer.UOIF,
		"FRANCE15":     prayer.France15,
		"FRANCE18":     prayer.France18,
		"TUNISIA":      prayer.Tunisia,
		"TEHRAN":       prayer.Tehran,
		"JAFARI":       prayer.Jafari,
	}
	resolver := methodMapping[method]
	if resolver == nil {
		resolver = methodMapping[strings.ToUpper(strings.TrimSpace(fallback))]
	}
	if resolver == nil {
		return prayer.MWL()
	}
	return resolver()
}

func normalizeAsrMethod(raw string) prayer.AsrConvention {
	method := strings.ToLower(strings.TrimSpace(raw))
	if method == "hanafi" {
		return prayer.Hanafi
	}
	return prayer.Shafii
}

// GetShalatScheduleByCoordinate is handler of get shalat schedule by coordinate
func GetShalatScheduleByCoordinate(ctx context.Context, browserID, method, fallbackMethod, asrMethod, latitude, longitude, month, year string) (map[string]any, error) {
	namespace := "usecase.GetShalatScheduleByCoordinate"
	span := sentry.StartSpan(ctx, namespace)
	defer span.Finish()

	method = normalizeAladhanMethod(method, "3")
	twilightConvention := normalizeFallbackMethod(fallbackMethod, "Kemenag")
	asrConvention := normalizeAsrMethod(asrMethod)

	// if lat long is invalid, then simply return true
	latInt, _ := strconv.ParseFloat(latitude, 64)
	lonInt, _ := strconv.ParseFloat(longitude, 64)

	// Create cache key for location-based caching
	cacheKey := cacheManager.GenerateLocationCacheKey(cache.LocationCacheKey{
		BrowserID:      browserID,
		Latitude:       latInt,
		Longitude:      lonInt,
		Month:          month,
		Year:           year,
		PrimaryMethod:  method,
		FallbackMethod: strings.ToUpper(strings.TrimSpace(fallbackMethod)),
		AsrMethod:      strings.ToLower(strings.TrimSpace(asrMethod)),
	})

	// Try to get from cache first and extend expiration on hit
	var cachedResult map[string]any
	cacheDuration, err := strconv.Atoi(os.Getenv("CACHE_DURATION_IN_HOURS"))
	if err != nil {
		logger.Log.Errorln(namespace, "strconv.Atoi", err)
		cacheDuration = 24
	}
	if err := cacheManager.GetLocationCacheAndExtend(ctx, cacheKey, &cachedResult, time.Duration(cacheDuration)*time.Hour); err == nil {
		logger.Log.Infoln(namespace, "cache hit for browserID:", browserID, "location:", latitude, longitude, "cache key:", cacheKey, "- extended cache duration")
		return cachedResult, nil
	}

	logger.Log.Infoln(namespace, "cache miss for browserID:", browserID, "location:", latitude, longitude, "cache key:", cacheKey)

	schedules, err := aladhan.GetShalatScheduleByCoordinate(ctx, method, latInt, lonInt, month, year)
	if err != nil {
		logger.Log.Infoln(namespace, "aladhan api returned error data. recalculate prayer times using go-prayer", latInt, lonInt)
		schedules, err = calculatePrayerTimes(ctx, latInt, lonInt, time.Now(), twilightConvention, asrConvention)
	}
	if err != nil {
		logger.Log.Errorln(namespace, "getShalatScheduleByCoordinate", err)
		return nil, err
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
		logger.Log.Errorln(namespace, "getLocationByCoordinate", err)
		res["address"] = fmt.Sprintf("Location %v, %v", latitude, longitude)
		res["countryCode"] = ""
	} else {
		res["address"] = locationRes["address"]
		res["countryCode"] = locationRes["countryCode"]
	}

	// Cache the result for 24 hours
	if err := cacheManager.SetLocationCache(ctx, cacheKey, res, 24*time.Hour); err != nil {
		logger.Log.Errorln(namespace, "failed to cache result:", err, "cache key:", cacheKey)
		// Don't return error here, just log it since caching failure shouldn't break the functionality
	} else {
		logger.Log.Infoln(namespace, "cached result for browserID:", browserID, "location:", latitude, longitude, "cache key:", cacheKey)
	}

	return res, nil
}

// GetShalatScheduleByLocation is handler of get shalat schedule by location
// for now, immediately use aladhan.com api coz kemenag backend still under development
func GetShalatScheduleByLocation(ctx context.Context, browserID, method, fallbackMethod, asrMethod, province, city, month, year string) (map[string]any, error) {
	namespace := "usecase.GetShalatScheduleByLocation"
	span := sentry.StartSpan(ctx, namespace)
	defer span.Finish()

	method = normalizeAladhanMethod(method, "3")
	twilightConvention := normalizeFallbackMethod(fallbackMethod, "Kemenag")
	asrConvention := normalizeAsrMethod(asrMethod)

	location := fmt.Sprintf("%s,%s", city, province)
	location = strings.ToLower(location)
	location = strings.Replace(location, "d.i. ", "", -1)
	location = strings.Replace(location, "kab. ", "", -1)
	location = strings.Replace(location, "kota ", "", -1)
	location = strings.TrimSpace(location)

	// get coordinate by location
	coordinate, err := openstreetmap.GetCoordinateByLocation(ctx, location)
	if err != nil {
		logger.Log.Errorln(namespace, "getCoordinateByLocation", err)
		return nil, err
	}

	// parse result
	latitude, _ := strconv.ParseFloat(coordinate["lat"].(string), 64)
	longitude, _ := strconv.ParseFloat(coordinate["lon"].(string), 64)

	// Create cache key for location-based caching
	cacheKey := cacheManager.GenerateLocationCacheKey(cache.LocationCacheKey{
		BrowserID:      browserID,
		Latitude:       latitude,
		Longitude:      longitude,
		Month:          month,
		Year:           year,
		PrimaryMethod:  method,
		FallbackMethod: strings.ToUpper(strings.TrimSpace(fallbackMethod)),
		AsrMethod:      strings.ToLower(strings.TrimSpace(asrMethod)),
	})

	// Try to get from cache first and extend expiration on hit
	var cachedResult map[string]any
	cacheDuration, err := strconv.Atoi(os.Getenv("CACHE_DURATION_IN_HOURS"))
	if err != nil {
		logger.Log.Errorln(namespace, "strconv.Atoi", err)
		cacheDuration = 24
	}
	if err := cacheManager.GetLocationCacheAndExtend(ctx, cacheKey, &cachedResult, time.Duration(cacheDuration)*time.Hour); err == nil {
		logger.Log.Infoln(namespace, "cache hit for browserID:", browserID, "location:", province, city, "- extended cache duration")
		return cachedResult, nil
	}

	logger.Log.Infoln(namespace, "cache miss for browserID:", browserID, "location:", province, city)

	schedules, err := aladhan.GetShalatScheduleByCoordinate(ctx, method, latitude, longitude, month, year)
	if err != nil {
		logger.Log.Infoln(namespace, "aladhan api returned error data. recalculate prayer times using go-prayer", latitude, longitude)
		schedules, err = calculatePrayerTimes(ctx, latitude, longitude, time.Now(), twilightConvention, asrConvention)
	}
	if err != nil {
		logger.Log.Errorln(namespace, "getShalatScheduleByCoordinate", err)
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

	// Cache the result for 24 hours
	if err := cacheManager.SetLocationCache(ctx, cacheKey, res, 24*time.Hour); err != nil {
		logger.Log.Errorln(namespace, "failed to cache result:", err, "cache key:", cacheKey)
		// Don't return error here, just log it since caching failure shouldn't break the functionality
	} else {
		logger.Log.Infoln(namespace, "cached result for browserID:", browserID, "location:", latitude, longitude, "cache key:", cacheKey)
	}

	return res, nil
}

func calculatePrayerTimes(ctx context.Context, lat, lon float64, date time.Time, twilightConvention *prayer.TwilightConvention, asrConvention prayer.AsrConvention) ([]aladhan.PrayerTimeSchedule, error) {
	namespace := "usecase.calculatePrayerTimes"
	span := sentry.StartSpan(ctx, namespace)
	defer span.Finish()

	var timezone *time.Location
	zone, err := tz.GetZone(tz.Point{Lat: lat, Lon: lon})
	if err != nil {
		logger.Log.Errorln(namespace, "tz.GetZone", err)
	} else {
		timezone, err = time.LoadLocation(zone[0])
		if err != nil {
			logger.Log.Errorln(namespace, "time.LoadLocation", err)
		}
	}

	schedulesBackup, err := goprayer.CalculatePrayerTimes(ctx, lat, lon, timezone, date, twilightConvention, asrConvention)
	if err != nil {
		logger.Log.Errorln(namespace, "goprayer.CalculatePrayerTimes", err)
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

	fmt.Println("schedules", pkg_common.ConvertToJsonString(schedules))
	return schedules, nil
}
