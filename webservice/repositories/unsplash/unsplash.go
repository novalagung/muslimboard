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
	log := logger.New(namespace)

	span := sentry.StartSpan(ctx, namespace)
	span.Description = namespace
	span.Finish()

	resp, err := resty.New().
		SetDebug(os.Getenv("DEBUG") == "true").
		R().
		SetContext(span.Context()).
		Get(url)
	if err != nil {
		log.Error(ctx, fmt.Errorf("resty.Get %w", err))
		return "", nil, err
	}
	if resp.IsError() {
		err = fmt.Errorf("%v", resp)
		log.Error(ctx, fmt.Errorf("resp.IsError %w", err))
		return "", nil, err
	}

	contentType := resp.Header().Get("Content-type")
	return contentType, resp.RawBody(), nil
}
