package goprayer

import (
	"context"
	"time"

	"github.com/hablullah/go-prayer"
	"muslimboard-api.novalagung.com/pkg/logger"
)

func CalculatePrayerTimes(ctx context.Context, lat, long float64, timezone *time.Location, date time.Time, twilightConvention *prayer.TwilightConvention) ([]prayer.Schedule, error) {
	namespace := "repositories.go-prayer.CalculatePrayerTimes"

	cfg := prayer.Config{
		Latitude:           lat,
		Longitude:          long,
		Timezone:           timezone,
		TwilightConvention: twilightConvention,
		AsrConvention:      prayer.Shafii,
		PreciseToSeconds:   false,
	}
	schedules, err := prayer.Calculate(cfg, date.Year())
	if err != nil {
		logger.Log.Errorln(namespace, "prayer.Calculate", err)
		return nil, err
	}

	// filter by current month
	filteredSchedules := make([]prayer.Schedule, 0)
	for _, each := range schedules {
		dt, _ := time.Parse("2006-01-02", each.Date)
		if dt.Month() != date.Month() {
			continue
		}
		filteredSchedules = append(filteredSchedules, each)
	}

	return filteredSchedules, nil
}
