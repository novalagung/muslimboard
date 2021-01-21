package main

import (
	"log"
	"net/http"

	endpoints "muslimboard-api.novalagung.com/ws/endpoints"
)

func main() {
	http.HandleFunc("/muslimboard-api", endpoints.MuslimboardApi)

	port := ":8080"
	log.Println("listening to", port)
	err := http.ListenAndServe(port, nil)
	if err != nil {
		log.Fatal(err)
	}
}
