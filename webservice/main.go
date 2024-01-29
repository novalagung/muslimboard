package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"time"

	sentryhttp "github.com/getsentry/sentry-go/http"
	"github.com/joho/godotenv"
	"muslimboard-api.novalagung.com/models"
	"muslimboard-api.novalagung.com/pkg/logger"
	"muslimboard-api.novalagung.com/pkg/otel"
	"muslimboard-api.novalagung.com/pkg/sentry"
	router "muslimboard-api.novalagung.com/router"
)

func main() {
	namespace := models.Namespace("main")
	logger.Init(slog.LevelDebug)

	// handle SIGINT (CTRL+C) gracefully
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	// load config
	err := godotenv.Load()
	if err != nil {
		slog.Error(namespace, "env error", err)
		return
	}

	// init sentry
	err = sentry.Init()
	if err != nil {
		slog.Error(namespace, "sentry error", err)
		return
	}
	defer sentry.Flush(2 * time.Second)

	// init otel
	shutdown, err := otel.Init(ctx)
	if err != nil {
		slog.Error(namespace, "otel error", err)
		return
	}
	defer func() { shutdown(ctx) }()

	// sentry middleware
	sentryHandler := sentryhttp.New(sentryhttp.Options{})
	http.HandleFunc("/muslimboard-api", sentryHandler.HandleFunc(router.MuslimboardApi))

	// start webserver
	port := ":" + os.Getenv("WEBSERVER_PORT")
	slog.Debug(namespace, "listening to", port)
	handler := sentryhttp.New(sentryhttp.Options{}).Handle(http.DefaultServeMux)
	srvErr := make(chan error, 1)
	go func() {
		srvErr <- http.ListenAndServe(port, handler)
	}()

	// handle graceful shutdown
	select {
	case err = <-srvErr:
		slog.Error(namespace, "http server error", err)
		return
	case <-ctx.Done():
		stop()
	}
}
