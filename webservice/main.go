package main

import (
	"net/http"
	"os"

	log "github.com/sirupsen/logrus"
	router "muslimboard-api.novalagung.com/router"
)

func main() {
	log.SetLevel(log.DebugLevel)

	http.HandleFunc("/muslimboard-api", router.MuslimboardApi)

	port := ":" + os.Getenv("PORT")
	log.Infoln("listening to", port)

	err := http.ListenAndServe(port, nil)
	if err != nil {
		log.Fatal(err)
	}
}
