package logger

import (
	"context"
	"log/slog"
	"os"

	"github.com/getsentry/sentry-go"
)

type Logger struct {
	namespace string
}

func Init(level slog.Level) {
	namespace := "pkg.logger"
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: level,
	})))
	slog.Debug(namespace, "action", "initializing logger")
}

func New(namespace string) *Logger {
	l := new(Logger)
	l.namespace = namespace
	return l
}

func (l *Logger) Debug(ctx context.Context, args ...any) {
	slog.Debug(l.namespace, args...)
}

func (l *Logger) Info(ctx context.Context, args ...any) {
	slog.Info(l.namespace, args...)
}

func (l *Logger) Error(ctx context.Context, err error) {
	slog.Error(l.namespace, "message", err)
	hub := sentry.CurrentHub()
	client, scope := hub.Client(), hub.Scope()
	client.CaptureException(
		err,
		&sentry.EventHint{Context: ctx},
		scope,
	)
}
