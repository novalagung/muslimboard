package unsplash

import (
	"context"
	"fmt"
	"io"
	"os"

	"github.com/go-resty/resty/v2"
	"muslimboard-api.novalagung.com/models"
	"muslimboard-api.novalagung.com/pkg/logger"
	"muslimboard-api.novalagung.com/pkg/otel"
)

// GetImage gets image from unsplash
func GetImage(ctx context.Context, url string) (string, io.ReadCloser, error) {
	namespace := models.Namespace("repositories.unsplash.GetImage")
	log := logger.New(namespace)

	ctx, span := otel.Tracer.Start(ctx, namespace)
	defer span.End()

	resp, err := resty.New().
		SetDebug(os.Getenv("DEBUG") == "true").
		R().
		SetContext(ctx).
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
