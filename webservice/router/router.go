package router

import (
	"fmt"
	"log/slog"
	"net/http"

	"github.com/getsentry/sentry-go"
	"muslimboard-api.novalagung.com/handler"
	pkg_http "muslimboard-api.novalagung.com/pkg/http"
)

// MuslimboardApi do get coordinate by location details
func MuslimboardApi(w http.ResponseWriter, r *http.Request) {
	namespace := "router.MuslimboardApi"
	ctx := r.Context()

	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "OPTIONS, GET")
	w.Header().Set("Access-Control-Allow-Headers", "*")
	w.Header().Set("Access-Control-Max-Age", "3600")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	if r.Method == http.MethodGet {
		op := r.URL.Query().Get("op")

		span := sentry.StartSpan(ctx, op)
		span.Description = op
		span.Finish()

		switch op {

		case "ping":
			pkg_http.WriteRespose(w, r, http.StatusOK, true, nil)

		case "image":
			slog.Info(namespace, "incoming request", "op="+op, r.URL.String())
			handler.HandleImage(span.Context(), w, r)

		case "shalat-schedule-by-coordinate":
			slog.Info(namespace, "incoming request", "op="+op, r.URL.String())
			handler.HandleShalatScheduleByCoordinate(span.Context(), w, r)

		case "shalat-schedule-by-location":
			slog.Info(namespace, "incoming request", "op="+op, r.URL.String())
			handler.HandleShalatScheduleByLocation(span.Context(), w, r)

		default:
			err := fmt.Errorf("bad request. unrecognized operation")
			pkg_http.WriteRespose(w, r, http.StatusBadRequest, nil, err)
		}
	} else {
		err := fmt.Errorf("bad request. unrecognized method")
		pkg_http.WriteRespose(w, r, http.StatusBadRequest, nil, err)
	}
}
