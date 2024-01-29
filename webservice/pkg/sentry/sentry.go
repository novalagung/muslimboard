package sentry

import (
	"os"
	"strconv"
	"time"

	"github.com/getsentry/sentry-go"
)

func Init() error {
	cfg := sentry.ClientOptions{
		Dsn:                os.Getenv("SENTRY_DSN"),
		EnableTracing:      os.Getenv("SENTRY_TRACING") == "true",
		TracesSampleRate:   func() float64 { f, _ := strconv.ParseFloat(os.Getenv("SENTRY_TRACES_SAMPLE_RATE"), 64); return f }(),
		ProfilesSampleRate: func() float64 { f, _ := strconv.ParseFloat(os.Getenv("SENTRY_PROFILES_SAMPLE_RATE"), 64); return f }(),
		Debug:              true,
	}
	err := sentry.Init(cfg)
	if err != nil {
		return err
	}

	return nil
}

func Flush(d time.Duration) {
	sentry.Flush(d)
}
