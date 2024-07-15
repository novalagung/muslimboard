package aladhan

type PrayerTime struct {
	Code   int                  `json:"code"`
	Status string               `json:"status"`
	Data   []PrayerTimeSchedule `json:"data"`
}

type PrayerTimeSchedule struct {
	Date    PrayerTimeDate    `json:"date"`
	Timings PrayerTimeTimings `json:"timings"`
}

type PrayerTimeDate struct {
	Gregorian PrayerTimeDateDetails `json:"gregorian"`
	Hijri     PrayerTimeDateDetails `json:"hijri"`
}

type PrayerTimeTimings struct {
	Fajr    string `json:"Fajr"`
	Sunrise string `json:"Sunrise"`
	Dhuhr   string `json:"Dhuhr"`
	Asr     string `json:"Asr"`
	Maghrib string `json:"Maghrib"`
	Isha    string `json:"Isha"`
}

type PrayerTimeDateDetails struct {
	Date string `json:"date"`
}
