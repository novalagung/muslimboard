package main

import (
	"log"
	"net/http"
	"os"

	endpoints "muslimboard-api.novalagung.com/endpoints"
)

func main() {
	http.HandleFunc("/muslimboard-api", endpoints.MuslimboardApi)

	port := ":" + os.Getenv("PORT")
	log.Println("listening to", port)

	err := http.ListenAndServe(port, nil)
	if err != nil {
		log.Fatal(err)
	}
}
