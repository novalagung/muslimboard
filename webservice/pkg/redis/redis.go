package redis

import (
	"os"

	"github.com/redis/go-redis/v9"
)

func NewRedis() *redis.Client {
	return redis.NewClient(&redis.Options{
		Addr:     os.Getenv("REDIS_HOST"),
		Password: "",
		DB:       0,
	})
}
