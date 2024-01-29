package sentry

import (
	"log/slog"
	"os"
	"strconv"
	"time"

	"github.com/getsentry/sentry-go"
	"muslimboard-api.novalagung.com/models"
)

func Init() error {
	namespace := models.Namespace("pkg.sentry")
	slog.Debug(namespace, "action", "initializing sentry")

	dsn := os.Getenv("SENTRY_DSN")
	enableTracing := os.Getenv("SENTRY_TRACING") == "true"
	tracesSampleRate := func() float64 { f, _ := strconv.ParseFloat(os.Getenv("SENTRY_TRACES_SAMPLE_RATE"), 64); return f }()
	profilesSampleRate := func() float64 { f, _ := strconv.ParseFloat(os.Getenv("SENTRY_PROFILES_SAMPLE_RATE"), 64); return f }()

	err := sentry.Init(sentry.ClientOptions{
		Dsn:                dsn,
		EnableTracing:      enableTracing,
		TracesSampleRate:   tracesSampleRate,
		ProfilesSampleRate: profilesSampleRate,
		Debug:              false,
	})
	if err != nil {
		return err
	}

	return nil
}

func Flush(d time.Duration) {
	sentry.Flush(d)
}
