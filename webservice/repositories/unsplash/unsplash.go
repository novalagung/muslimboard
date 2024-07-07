package unsplash

import (
	"context"
	"fmt"
	"io"
	"os"

	"github.com/go-resty/resty/v2"
	log "github.com/sirupsen/logrus"
)

// GetImage gets image from unsplash
func GetImage(ctx context.Context, url string) (string, io.ReadCloser, error) {
	namespace := "repositories.unsplash.GetImage"

	resp, err := resty.New().
		SetDebug(os.Getenv("DEBUG") == "true").
		R().
		SetContext(ctx).
		Get(url)
	if err != nil {
		log.Errorln(namespace, "resty.Get", err.Error())
		return "", nil, err
	}
	if resp.IsError() {
		err = fmt.Errorf("%v", resp.Error())
		log.Errorln(namespace, "resp.IsError", err.Error())
		return "", nil, err
	}

	contentType := resp.Header().Get("Content-type")
	return contentType, resp.RawBody(), nil
}
