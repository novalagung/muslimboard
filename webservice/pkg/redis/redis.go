package redis

import (
	"os"

	"github.com/redis/go-redis/v9"
)

// NewRedis creates a new Redis client instance
func NewRedis() *redis.Client {
	return redis.NewClient(&redis.Options{
		Addr:     os.Getenv("REDIS_HOST"),
		Password: "",
		DB:       0,
	})
}
