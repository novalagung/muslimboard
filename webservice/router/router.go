package router

import (
	"fmt"
	"net/http"

	"github.com/getsentry/sentry-go"
	"muslimboard-api.novalagung.com/handler"
	pkg_http "muslimboard-api.novalagung.com/pkg/http"
	"muslimboard-api.novalagung.com/pkg/logger"
)

// MuslimboardApi do get coordinate by location details
func MuslimboardApi(w http.ResponseWriter, r *http.Request) {
	namespace := "router.MuslimboardApi"
	log := logger.New(namespace)

	op := fmt.Sprintf("%s %s", r.Method, r.URL.Query().Get("op"))
	span := sentry.StartSpan(r.Context(), op)
	span.Description = op
	span.Finish()

	log.Debug(span.Context(), "action", "incoming request", "method", r.Method, "path", r.URL.String())

	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "OPTIONS, GET")
	w.Header().Set("Access-Control-Allow-Headers", "*")
	w.Header().Set("Access-Control-Max-Age", "3600")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	if r.Method == http.MethodGet {
		switch op {

		case "ping":
			pkg_http.WriteRespose(w, r, http.StatusOK, true, nil)

		case "image":
			handler.HandleImage(span.Context(), w, r)

		case "shalat-schedule-by-coordinate":
			handler.HandleShalatScheduleByCoordinate(span.Context(), w, r)

		case "shalat-schedule-by-location":
			handler.HandleShalatScheduleByLocation(span.Context(), w, r)

		default:
			err := fmt.Errorf("bad request. unrecognized operation")
			log.Error(span.Context(), err)
			pkg_http.WriteRespose(w, r, http.StatusBadRequest, nil, err)
		}
	} else {
		err := fmt.Errorf("bad request. unrecognized method")
		log.Error(span.Context(), err)
		pkg_http.WriteRespose(w, r, http.StatusBadRequest, nil, err)
	}
}
