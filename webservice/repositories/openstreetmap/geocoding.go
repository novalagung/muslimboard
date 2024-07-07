package openstreetmap

type GeocodingAddress struct {
	Amenity       string `json:"amenity"`
	Road          string `json:"road"`
	Neighbourhood string `json:"neighbourhood"`
	Suburb        string `json:"suburb"`
	Village       string `json:"village"`
	County        string `json:"county"`
	City          string `json:"city"`
	State         string `json:"state"`
	Postcode      string `json:"postcode"`
	Country       string `json:"country"`
	CountryCode   string `json:"country_code"`
	HouseNumber   string `json:"house_number"`
	Shop          string `json:"shop"`
	Subdistrict   string `json:"subdistrict"`
	Region        string `json:"region"`
}

type GeocodingNameDetail struct {
	Name string `json:"name"`
}

type Geocoding struct {
	PlaceID     int                 `json:"place_id"`
	Licence     string              `json:"licence"`
	OsmType     string              `json:"osm_type"`
	OsmID       int                 `json:"osm_id"`
	Lat         string              `json:"lat"`
	Lon         string              `json:"lon"`
	DisplayName string              `json:"display_name"`
	Address     GeocodingAddress    `json:"address"`
	NameDetail  GeocodingNameDetail `json:"namedetails"`
	BoundingBox []string            `json:"boundingbox"`
	Class       string              `json:"class"`
	Type        string              `json:"type"`
	Importance  float64             `json:"importance"`
	Icon        string              `json:"icon"`
}
