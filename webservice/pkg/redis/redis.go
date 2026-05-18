package redis

import (
	"context"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
	"muslimboard-api.novalagung.com/pkg/logger"
)

// NewRedis creates a new Redis client instance
func NewRedis() *redis.Client {
	return redis.NewClient(&redis.Options{
		Addr:     os.Getenv("REDIS_HOST"),
		Password: "",
		DB:       0,
	})
}

// AllowRateLimit returns true when the request is within limit; on Redis errors it fails open.
func AllowRateLimit(ctx context.Context, key string, limit int64, expiration time.Duration) bool {
	client := NewRedis()
	count, err := client.Incr(ctx, key).Result()
	if err != nil {
		logger.Log.Errorln("pkg.redis.AllowRateLimit", "redis.Incr", err)
		return true
	}
	if count == 1 {
		client.Expire(ctx, key, expiration).Err()
	}
	return count <= limit
}
