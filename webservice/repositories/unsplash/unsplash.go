package unsplash

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"os"

	"github.com/getsentry/sentry-go"
	"github.com/go-resty/resty/v2"
)

// GetImage gets image from unsplash
func GetImage(ctx context.Context, url string) (string, io.ReadCloser, error) {
	namespace := "repositories.unsplash.GetImage"

	span := sentry.StartSpan(ctx, namespace)
	span.Description = namespace
	span.Finish()

	resp, err := resty.New().
		SetDebug(os.Getenv("DEBUG") == "true").
		R().
		SetContext(span.Context()).
		Get(url)
	if err != nil {
		slog.Error(namespace, "resty.Get", err)
		return "", nil, err
	}
	if resp.IsError() {
		err = fmt.Errorf("%v", resp)
		slog.Error(namespace, "resp.IsError", err)
		return "", nil, err
	}

	contentType := resp.Header().Get("Content-type")
	return contentType, resp.RawBody(), nil
}
