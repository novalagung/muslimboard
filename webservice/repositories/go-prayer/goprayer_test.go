package goprayer

import (
	"fmt"
	"testing"
	"time"

	"github.com/hablullah/go-prayer"
)

func TestPrayerTimes(t *testing.T) {
	schedules, err := CalculatePrayerTimes(-7.983908, 112.621391, time.Now(), prayer.MWL())
	fmt.Println("err", err)
	fmt.Println("schedules", schedules)

	tz, _ := time.LoadLocation("Asia/Jakarta")

	for _, each := range schedules {
		fmt.Println("each.Date", each.Date)
		fmt.Println("  => Fajr", each.Fajr.In(tz).String())
		fmt.Println("  => Sunrise", each.Sunrise.In(tz).String())
		fmt.Println("  => Zuhr", each.Zuhr.In(tz).String())
		fmt.Println("  => Asr", each.Asr.In(tz).String())
		fmt.Println("  => Maghrib", each.Maghrib.In(tz).String())
		fmt.Println("  => Isha", each.Isha.In(tz).String())
	}
}
