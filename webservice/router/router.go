package router

import (
	"fmt"
	"net/http"

	"muslimboard-api.novalagung.com/handler"
	pkg_http "muslimboard-api.novalagung.com/pkg/http"
	"muslimboard-api.novalagung.com/pkg/logger"
	"muslimboard-api.novalagung.com/pkg/otel"
)

// MuslimboardApi do get coordinate by location details
func MuslimboardApi(w http.ResponseWriter, r *http.Request) {
	namespace := "router.MuslimboardApi"
	log := logger.New(namespace)

	op := r.URL.Query().Get("op")
	ctx, span := otel.Tracer.Start(r.Context(), fmt.Sprintf("%s %s", r.Method, op))
	defer span.End()

	log.Debug(ctx, "action", "incoming request", "method", r.Method, "path", r.URL.String())

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
			handler.HandleImage(ctx, w, r)

		case "shalat-schedule-by-coordinate":
			handler.HandleShalatScheduleByCoordinate(ctx, w, r)

		case "shalat-schedule-by-location":
			handler.HandleShalatScheduleByLocation(ctx, w, r)

		default:
			err := fmt.Errorf("bad request. unrecognized operation")
			log.Error(ctx, err)
			pkg_http.WriteRespose(w, r, http.StatusBadRequest, nil, err)
		}
	} else {
		err := fmt.Errorf("bad request. unrecognized method")
		log.Error(ctx, err)
		pkg_http.WriteRespose(w, r, http.StatusBadRequest, nil, err)
	}
}
