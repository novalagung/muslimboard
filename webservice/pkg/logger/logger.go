package logger

import (
	"os"

	"github.com/evalphobia/logrus_sentry"
	"github.com/getsentry/sentry-go"
	"github.com/sirupsen/logrus"
)

var Log = logrus.New()

func Init() {
	sentryDSN := os.Getenv("SENTRY_DSN")
	if sentryDSN == "" {
		return
	}

	Log.SetLevel(logrus.DebugLevel)

	err := sentry.Init(sentry.ClientOptions{
		Dsn:           sentryDSN,
		EnableTracing: true,
		Debug:         false,
	})
	if err != nil {
		Log.Fatalf("sentry.Init: %s", err)
	}

	hook, err := logrus_sentry.NewSentryHook(sentryDSN, []logrus.Level{
		logrus.PanicLevel,
		logrus.FatalLevel,
		logrus.ErrorLevel,
	})
	if err == nil {
		Log.Hooks.Add(hook)
	}
}
