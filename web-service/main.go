package main

import (
	"log"
	endpoints "muslimboard-api.novalagung.com/ws/endpoints"
	"net/http"
)

func main() {
	http.HandleFunc("/coordinate-by-location", endpoints.GetCoordinateByLocation)
	http.HandleFunc("/location-by-coordinate", endpoints.GetLocationByCoordinate)

	port := ":8080"
	log.Println("listening to", port)
	err := http.ListenAndServe(port, nil)
	if err != nil {
		log.Fatal(err)
	}
}
