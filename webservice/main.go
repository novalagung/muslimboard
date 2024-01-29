package main

import (
	"log/slog"
	"net/http"
	"os"
	"time"

	sentryhttp "github.com/getsentry/sentry-go/http"
	"github.com/joho/godotenv"
	"muslimboard-api.novalagung.com/pkg/logger"
	"muslimboard-api.novalagung.com/pkg/sentry"
	router "muslimboard-api.novalagung.com/router"
)

func main() {
	namespace := "main"
	logger.Init(slog.LevelDebug)

	err := godotenv.Load()
	if err != nil {
		slog.Error(namespace, "env error", err)
		return
	}

	err = sentry.Init()
	if err != nil {
		slog.Error(namespace, "sentry error", err)
		return
	}

	sentryHandler := sentryhttp.New(sentryhttp.Options{})
	http.HandleFunc("/muslimboard-api", sentryHandler.HandleFunc(router.MuslimboardApi))

	port := ":" + os.Getenv("WEBSERVER_PORT")
	slog.Debug(namespace, "listening to", port)

	handler := sentryhttp.New(sentryhttp.Options{}).Handle(http.DefaultServeMux)
	err = http.ListenAndServe(port, handler)
	if err != nil {
		slog.Error(namespace, "http server error", err)
		return
	}

	defer sentry.Flush(2 * time.Second)
}
