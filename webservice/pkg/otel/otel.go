package otel

import (
	"context"
	"errors"
	"log/slog"

	sentryotel "github.com/getsentry/sentry-go/otel"
	"go.opentelemetry.io/otel"
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

	// Set up propagator.
	prop := newPropagator()
	otel.SetTextMapPropagator(prop)

	// Set up trace provider.
	tracerProvider, err := newTraceProvider()
	if err != nil {
		err = errors.Join(err, shutdown(ctx))
		return nil, err
	}
	Tracer = tracerProvider.Tracer(models.ProjectName)

	shutdownFuncs = append(shutdownFuncs, tracerProvider.Shutdown)
	otel.SetTracerProvider(tracerProvider)

	// // Set up meter provider.
	// meterProvider, err := newMeterProvider()
	// if err != nil {
	// 	err = errors.Join(err, shutdown(ctx))
	// 	return nil, err
	// }
	// shutdownFuncs = append(shutdownFuncs, meterProvider.Shutdown)
	// otel.SetMeterProvider(meterProvider)

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

	traceProvider := sdktrace.NewTracerProvider(
		sdktrace.WithSpanProcessor(sentryotel.NewSentrySpanProcessor()),
	)
	return traceProvider, nil
}

// func newMeterProvider() (*metric.MeterProvider, error) {
// 	metricExporter, err := stdoutmetric.New()
// 	if err != nil {
// 		return nil, err
// 	}

// 	meterProvider := metric.NewMeterProvider(
// 		metric.WithReader(metric.NewPeriodicReader(metricExporter, metric.WithInterval(3*time.Second))),
// 	)
// 	return meterProvider, nil
// }
