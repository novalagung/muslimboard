package router

import (
	"fmt"
	"net/http"
	"time"

	"github.com/getsentry/sentry-go"
	"muslimboard-api.novalagung.com/handler"
	pkg_http "muslimboard-api.novalagung.com/pkg/http"
	"muslimboard-api.novalagung.com/pkg/logger"
)

// MuslimboardApi do get coordinate by location details
func MuslimboardApi(w http.ResponseWriter, r *http.Request) {
	namespace := "router.MuslimboardApi"

	defer func() {
		err := recover()

		if err != nil {
			logger.Log.Errorln(namespace, err)
			pkg_http.WriteRespose(w, r, http.StatusInternalServerError, nil, fmt.Errorf("unknown server error"))

			sentry.CurrentHub().Recover(err)
			sentry.Flush(time.Second * 2)
		}
	}()

	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "OPTIONS, GET")
	w.Header().Set("Access-Control-Allow-Headers", "*")
	w.Header().Set("Access-Control-Max-Age", "3600")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	if r.Method == http.MethodGet {
		switch op := r.URL.Query().Get("op"); op {

		case "ping":
			pkg_http.WriteRespose(w, r, http.StatusOK, true, nil)

		case "image":
			logger.Log.Infoln(namespace, "incoming request", "op="+op, r.URL.String())
			handler.HandleImage(w, r)

		case "shalat-schedule-by-coordinate":
			logger.Log.Infoln(namespace, "incoming request", "op="+op, r.URL.String())
			handler.HandleShalatScheduleByCoordinate(w, r)

		case "shalat-schedule-by-location":
			logger.Log.Infoln(namespace, "incoming request", "op="+op, r.URL.String())
			handler.HandleShalatScheduleByLocation(w, r)

		default:
			err := fmt.Errorf("bad request. unrecognized operation")
			pkg_http.WriteRespose(w, r, http.StatusBadRequest, nil, err)
		}
	} else {
		err := fmt.Errorf("bad request. unrecognized method")
		pkg_http.WriteRespose(w, r, http.StatusBadRequest, nil, err)
	}
}
