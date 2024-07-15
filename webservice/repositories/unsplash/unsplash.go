package unsplash

import (
	"context"
	"fmt"
	"io"
	"os"

	"github.com/getsentry/sentry-go"
	"github.com/go-resty/resty/v2"
	"muslimboard-api.novalagung.com/pkg/logger"
)

// GetImage gets image from unsplash
func GetImage(ctx context.Context, url string) (string, io.ReadCloser, error) {
	namespace := "repositories.unsplash.GetImage"
	span := sentry.StartSpan(ctx, namespace)
	defer span.Finish()

	resp, err := resty.New().
		SetDebug(os.Getenv("DEBUG") == "true").
		R().
		SetContext(ctx).
		Get(url)
	if err != nil {
		logger.Log.Errorln(namespace, "resty.Get", err)
		return "", nil, err
	}
	if resp.IsError() {
		err = fmt.Errorf("%v", resp.Error())
		logger.Log.Errorln(namespace, "resp.IsError", err)
		return "", nil, err
	}

	contentType := resp.Header().Get("Content-type")
	return contentType, resp.RawBody(), nil
}
