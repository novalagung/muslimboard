package otel

import (
	"context"
	"errors"
	"log/slog"
	"os"

	sentryotel "github.com/getsentry/sentry-go/otel"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/stdout/stdouttrace"
	"go.opentelemetry.io/otel/propagation"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	"go.opentelemetry.io/otel/trace"
	"muslimboard-api.novalagung.com/models"
)

var Tracer trace.Tracer

func Init(ctx context.Context) (func(context.Context) error, error) {
	namespace := models.Namespace("pkg.otel")
	slog.Debug(namespace, "action", "initializing open telemetry")

	var shutdownFuncs []func(context.Context) error
	var err error

	shutdown := func(ctx context.Context) error {
		var err error
		for _, fn := range shutdownFuncs {
			err = errors.Join(err, fn(ctx))
		}
		shutdownFuncs = nil
		return err
	}

	// Set up trace provider.
	tracerProvider, err := newTraceProvider()
	if err != nil {
		err = errors.Join(err, shutdown(ctx))
		return nil, err
	}
	Tracer = tracerProvider.Tracer(models.ProjectName)

	shutdownFuncs = append(shutdownFuncs, tracerProvider.Shutdown)
	otel.SetTracerProvider(tracerProvider)

	// Set up propagator.
	prop := newPropagator()
	otel.SetTextMapPropagator(prop)

	return shutdown, err
}

func newPropagator() propagation.TextMapPropagator {
	// ==== sentry

	// return propagation.NewCompositeTextMapPropagator(
	// 	propagation.TraceContext{},
	// 	propagation.Baggage{},
	// )

	// ==== otel

	return sentryotel.NewSentryPropagator()
}

func newTraceProvider() (*sdktrace.TracerProvider, error) {
	// ==== sentry

	// traceExporter, err := stdouttrace.New(stdouttrace.WithPrettyPrint())
	// if err != nil {
	// 	return nil, err
	// }
	// traceProvider := sdktrace.NewTracerProvider(
	// 	trace.WithBatcher(traceExporter, sdktrace.WithBatchTimeout(time.Second)),
	// )
	// return traceProvider, nil

	// ==== otel

	opts := []sdktrace.TracerProviderOption{
		sdktrace.WithSpanProcessor(sentryotel.NewSentrySpanProcessor()),
		sdktrace.WithSampler(sdktrace.AlwaysSample()),
	}

	if os.Getenv("OPENTELEMETRY_DEBUG") == "true" {
		traceExporter, err := stdouttrace.New(stdouttrace.WithPrettyPrint())
		if err != nil {
			return nil, err
		}
		opts = append(opts, sdktrace.WithBatcher(traceExporter))
	}

	traceProvider := sdktrace.NewTracerProvider(opts...)
	return traceProvider, nil
}
