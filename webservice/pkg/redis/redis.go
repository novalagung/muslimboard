package redis

import "github.com/redis/go-redis/v9"

func NewRedis() *redis.Client {
	return redis.NewClient(&redis.Options{
		Addr:     "muslimboard-redis:6379",
		Password: "",
		DB:       0,
	})
}
