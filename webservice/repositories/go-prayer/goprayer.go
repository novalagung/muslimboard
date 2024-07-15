package goprayer

import (
	"time"

	"github.com/hablullah/go-prayer"
	log "github.com/sirupsen/logrus"
)

func CalculatePrayerTimes(lat, long float64, date time.Time, twilightConvention *prayer.TwilightConvention) ([]prayer.Schedule, error) {
	namespace := "repositories.go-prayer.CalculatePrayerTimes"
	cfg := prayer.Config{
		Latitude:           lat,
		Longitude:          long,
		TwilightConvention: twilightConvention,
		AsrConvention:      prayer.Shafii,
		PreciseToSeconds:   false,
	}
	schedules, err := prayer.Calculate(cfg, time.Now().Year())
	if err != nil {
		log.Errorln(namespace, "prayer.Calculate", err.Error())
		return nil, err
	}

	return schedules, nil
}
