package cache

import (
	"context"
	"crypto/md5"
	"encoding/json"
	"fmt"
	"time"

	redisClient "github.com/redis/go-redis/v9"
	redisPkg "muslimboard-api.novalagung.com/pkg/redis"
)

// CacheManager handles caching operations with location-based keys
type CacheManager struct {
	client *redisClient.Client
}

// NewCacheManager creates a new cache manager instance
func NewCacheManager() *CacheManager {
	return &CacheManager{
		client: redisPkg.NewRedis(),
	}
}

// LocationCacheKey represents a cache key for location-based caching
type LocationCacheKey struct {
	BrowserID string
	Latitude  float64
	Longitude float64
	Month     string
	Year      string
}

// generateLocationCacheKey creates a cache key based on browserID and normalized coordinates
// Coordinates are normalized to ~1km grid to allow cache hits for nearby locations
func (c *CacheManager) generateLocationCacheKey(key LocationCacheKey) string {
	// Normalize coordinates to ~1km precision
	// 1 degree latitude ≈ 111km, so 0.01 degree ≈ 1.11km
	// We'll use 0.01 degree precision for both lat and lng for simplicity
	// Format coordinates with exactly 2 decimal places to ensure consistency
	// This prevents floating-point precision issues like 106.83 vs 106.83000000000000
	latStr := fmt.Sprintf("%.2f", key.Latitude)
	lngStr := fmt.Sprintf("%.2f", key.Longitude)

	// Create a deterministic key
	keyStr := fmt.Sprintf("shalat_schedule:%s:%s:%s:%s:%s",
		key.BrowserID, latStr, lngStr, key.Month, key.Year)

	// Use MD5 hash to create a shorter, consistent key
	hash := md5.Sum([]byte(keyStr))
	return fmt.Sprintf("cache:%x", hash)
}

// SetLocationCache stores data in cache with location-based key
func (c *CacheManager) SetLocationCache(ctx context.Context, key LocationCacheKey, data interface{}, expiration time.Duration) error {
	cacheKey := c.generateLocationCacheKey(key)

	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("failed to marshal data: %w", err)
	}

	return c.client.Set(ctx, cacheKey, jsonData, expiration).Err()
}

// GetLocationCacheAndExtend retrieves data from cache and extends expiration time
func (c *CacheManager) GetLocationCacheAndExtend(ctx context.Context, key LocationCacheKey, result interface{}, expiration time.Duration) error {
	cacheKey := c.generateLocationCacheKey(key)

	data, err := c.client.Get(ctx, cacheKey).Result()
	if err != nil {
		return err
	}

	// Extend the cache expiration time on cache hit
	err = c.client.Expire(ctx, cacheKey, expiration).Err()
	if err != nil {
		// Log error but don't fail the operation since we have the data
		// The cache expiration extension failure shouldn't break the functionality
	}

	return json.Unmarshal([]byte(data), result)
}

// HasLocationCache checks if cache exists for the given location-based key
func (c *CacheManager) HasLocationCache(ctx context.Context, key LocationCacheKey) bool {
	cacheKey := c.generateLocationCacheKey(key)
	exists, err := c.client.Exists(ctx, cacheKey).Result()
	return err == nil && exists > 0
}
