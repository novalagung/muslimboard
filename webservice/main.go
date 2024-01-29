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
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"muslimboard-api.novalagung.com/models"
	"muslimboard-api.novalagung.com/pkg/logger"
	"muslimboard-api.novalagung.com/pkg/otel"
	"muslimboard-api.novalagung.com/pkg/sentry"
	router "muslimboard-api.novalagung.com/router"
)

func main() {
	namespace := models.Namespace("main")
	logger.Init(slog.LevelDebug)

	// SIGINT (CTRL+C) signal
	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt)
	defer cancel()

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

	// init otel
	shutdown, err := otel.Init(ctx)
	if err != nil {
		slog.Error(namespace, "otel error", err)
		return
	}

	// router & middleware
	var handler http.Handler = http.DefaultServeMux
	http.HandleFunc("/muslimboard-api", router.MuslimboardApi)
	handler = sentryhttp.New(sentryhttp.Options{}).Handle(handler)
	handler = otelhttp.NewHandler(handler, "/")

	// start webserver
	port := os.Getenv("WEBSERVER_HOST")
	slog.Debug(namespace, "listening to", port)
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
		sentry.Flush(2 * time.Second)
		shutdown(ctx)
		cancel()
	}
}
