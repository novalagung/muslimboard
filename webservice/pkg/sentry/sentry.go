package sentry

import (
	"fmt"
	"net/http"
	"os"

	"github.com/evalphobia/logrus_sentry"
	"github.com/getsentry/sentry-go"
	"github.com/sirupsen/logrus"
	"muslimboard-api.novalagung.com/pkg/logger"
)

func Init() {
	sentryDSN := os.Getenv("SENTRY_DSN")
	logger.Log.Infoln("initializing sentry. dsn:", sentryDSN)

	if sentryDSN == "" {
		return
	}

	err := sentry.Init(sentry.ClientOptions{
		Dsn:                sentryDSN,
		EnableTracing:      true,
		TracesSampleRate:   1.0,
		ProfilesSampleRate: 1.0,
		Debug:              false,
	})
	if err != nil {
		logger.Log.Fatalf("sentry.Init: %s", err)
	}

	hook, err := logrus_sentry.NewSentryHook(sentryDSN, []logrus.Level{
		logrus.PanicLevel,
		logrus.FatalLevel,
		logrus.ErrorLevel,
	})
	if err == nil {
		logger.Log.Hooks.Add(hook)
	}
}

func CreateSpan(r *http.Request) *sentry.Span {
	ctx := r.Context()
	hub := sentry.GetHubFromContext(ctx)
	if hub == nil {
		// Check the concurrency guide for more details: https://docs.sentry.io/platforms/go/concurrency/
		hub = sentry.CurrentHub().Clone()
		ctx = sentry.SetHubOnContext(ctx, hub)
	}

	txName := fmt.Sprintf("%s %s %s", r.Method, r.URL.Path, r.URL.Query().Get("op"))
	options := []sentry.SpanOption{
		// Set the OP based on values from https://develop.sentry.dev/sdk/performance/span-operations/
		sentry.WithOpName("http.server"),
		sentry.ContinueFromRequest(r),
		sentry.WithTransactionSource(sentry.SourceURL),
	}
	transaction := sentry.StartTransaction(ctx, txName, options...)

	return transaction
}
