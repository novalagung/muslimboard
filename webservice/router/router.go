package router

import (
	"fmt"
	"net/http"

	log "github.com/sirupsen/logrus"
	"muslimboard-api.novalagung.com/handler"
	pkg_http "muslimboard-api.novalagung.com/pkg/http"
)

// MuslimboardApi do get coordinate by location details
func MuslimboardApi(w http.ResponseWriter, r *http.Request) {
	logNamespace := "router.MuslimboardApi"

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
			log.Infoln(logNamespace, "incoming request", "op="+op, r.URL.String())
			handler.HandleImage(w, r)

		case "shalat-schedule-by-coordinate":
			log.Infoln(logNamespace, "incoming request", "op="+op, r.URL.String())
			handler.HandleShalatScheduleByCoordinate(w, r)

		case "shalat-schedule-by-location":
			log.Infoln(logNamespace, "incoming request", "op="+op, r.URL.String())
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
