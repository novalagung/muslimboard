package main

import (
	"log"
	"net/http"

	endpoints "muslimboard-api.novalagung.com/ws/endpoints"
)

func main() {
	http.HandleFunc("/coordinate-by-location", endpoints.GetCoordinateByLocation)
	http.HandleFunc("/location-by-coordinate", endpoints.GetLocationByCoordinate)
	http.HandleFunc("/shalat-schedule-by-coordinate", endpoints.GetShalatScheduleByCoordinate)
	http.HandleFunc("/shalat-schedule-by-location", endpoints.GetShalatScheduleByLocation)

	port := ":8080"
	log.Println("listening to", port)
	err := http.ListenAndServe(port, nil)
	if err != nil {
		log.Fatal(err)
	}
}
