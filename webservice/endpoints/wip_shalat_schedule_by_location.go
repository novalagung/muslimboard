package p

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"sync"

	"github.com/go-resty/resty/v2"
	"github.com/gocolly/colly/v2"
)

type City struct {
	Provinsi string `json:"provinsi"`
	Children []struct {
		Kabko string `json:"kabko"`
		ID    string `json:"id"`
	} `json:"children"`
}

var once = new(sync.Once)
var locations = make([]City, 0)

func GetShalatScheduleByLocation(w http.ResponseWriter, r *http.Request) {

	once.Do(func() {
		p := "./data-location-indonesia.json"
		p = "./../extension/data/data-location-indonesia.json"
		buf, err := ioutil.ReadFile(p)
		if err != nil {
			log.Fatal(err)
			return
		}
		err = json.Unmarshal(buf, &locations)
		if err != nil {
			log.Fatal(err)
			return
		}
	})

	var selectedCity, selectedRegion string

	id := r.URL.Query().Get("id")
	for _, region := range locations {
		for _, city := range region.Children {
			if city.ID == id {
				selectedCity = city.Kabko
				selectedRegion = region.Provinsi
			}
		}
	}

	log.Println("= selectedCity", selectedCity)
	log.Println("= selectedRegion", selectedRegion)

	return

	c := colly.NewCollector()

	err := c.Visit("https://bimasislam.kemenag.go.id/jadwalshalat")
	if err != nil {
		log.Println("err", err)
		return
	}

	c.OnError(func(r *colly.Response, err error) {
		fmt.Println("r", err)
	})

	c.OnHTML("a[href]", func(e *colly.HTMLElement) {
		fmt.Println("asdf", e.Attr("href"))
	})

	a := ""
	c.OnHTML("html body", func(e *colly.HTMLElement) {
		a = e.DOM.Text()
	})

	fmt.Println("asdf", a)
	// time.Sleep(5000)

	c.OnHTML("#search_prov option", func(e *colly.HTMLElement) {
		fmt.Println(e.Text)
	})

	return

	// dispatch query to open street map geocoding api
	resp, err := resty.New().R().
		SetBody(map[string]interface{}{
			"x":   `kFc%2BY164S6gfUMNsU50SOahN1WGW5Jc6F004lavj64EgxnmkNsk2rlLnga82p7JWsTmzDi98ZxH%2FLS1A%2BaLEvA%3D%3D`,
			"y":   `KyAFNdsvCPtpvNr0JKIyEIrwjVJ3ndBq%2FipqrW%2BBIi%2BAcyaVja%2FOUJgDH7QqBfOQygoBE8Xy%2B1USSMcRp5VZFw%3D%3D`,
			"bln": 12,
			"thn": 2021,
		}).
		Post("https://bimasislam.kemenag.go.id/ajax/getShalatbln")
	if err != nil {
		log.Println("error", err)
		return
	}
	if resp.IsError() {
		log.Println("error", err)
		return
	}

	log.Println(string(resp.Body()))
}
