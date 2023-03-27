package main

import (
	"log"
	"net/http"
	"os"

	router "muslimboard-api.novalagung.com/router"
)

func main() {
	http.HandleFunc("/muslimboard-api", router.MuslimboardApi)

	port := ":" + os.Getenv("PORT")
	log.Println("listening to", port)

	err := http.ListenAndServe(port, nil)
	if err != nil {
		log.Fatal(err)
	}
}
