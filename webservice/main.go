package main

import (
	"net/http"
	"os"
	"time"

	"github.com/getsentry/sentry-go"
	log "github.com/sirupsen/logrus"
	router "muslimboard-api.novalagung.com/router"
)

func main() {
	log.SetLevel(log.DebugLevel)

	sentryDSN := os.Getenv("SENTRY_DSN")
	if sentryDSN != "" {
		err := sentry.Init(sentry.ClientOptions{
			Dsn:   sentryDSN,
			Debug: true,
		})
		if err != nil {
			log.Fatalf("sentry.Init: %s", err)
		}
		defer sentry.Flush(2 * time.Second)
	}

	http.HandleFunc("/muslimboard-api", router.MuslimboardApi)

	port := "0.0.0.0:" + os.Getenv("PORT")
	log.Infoln("listening to", port)

	err := http.ListenAndServe(port, nil)
	if err != nil {
		log.Fatal(err)
	}
}
