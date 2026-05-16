package geonames

type Location struct {
	ID          int64   `json:"id"`
	Name        string  `json:"name"`
	Admin1Name  string  `json:"admin1Name"`
	Admin2Name  string  `json:"admin2Name"`
	CountryCode string  `json:"countryCode"`
	CountryName string  `json:"countryName"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	Timezone    string  `json:"timezone"`
	Population  int64   `json:"population"`
}
