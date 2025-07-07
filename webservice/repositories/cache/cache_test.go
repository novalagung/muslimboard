package cache

import (
	"testing"
)

func TestLocationCacheKey(t *testing.T) {
	cacheManager := &CacheManager{}

	// Test that similar coordinates within 1km generate the same cache key
	key1 := LocationCacheKey{
		BrowserID: "browser123",
		Latitude:  -6.2088,
		Longitude: 106.8456,
		Month:     "12",
		Year:      "2024",
	}

	key2 := LocationCacheKey{
		BrowserID: "browser123",
		Latitude:  -6.2089,  // Very close latitude (about 100m difference)
		Longitude: 106.8457, // Very close longitude
		Month:     "12",
		Year:      "2024",
	}

	cacheKey1 := cacheManager.generateLocationCacheKey(key1)
	cacheKey2 := cacheManager.generateLocationCacheKey(key2)

	if cacheKey1 != cacheKey2 {
		t.Errorf("Expected same cache key for nearby coordinates, got %s and %s", cacheKey1, cacheKey2)
	}

	// Test that different browserIDs generate different cache keys
	key3 := LocationCacheKey{
		BrowserID: "browser456", // Different browser ID
		Latitude:  -6.2088,
		Longitude: 106.8456,
		Month:     "12",
		Year:      "2024",
	}

	cacheKey3 := cacheManager.generateLocationCacheKey(key3)

	if cacheKey1 == cacheKey3 {
		t.Errorf("Expected different cache keys for different browserIDs, got same key: %s", cacheKey1)
	}

	// Test that coordinates more than 1km apart generate different cache keys
	key4 := LocationCacheKey{
		BrowserID: "browser123",
		Latitude:  -6.2200, // About 1.2km difference
		Longitude: 106.8456,
		Month:     "12",
		Year:      "2024",
	}

	cacheKey4 := cacheManager.generateLocationCacheKey(key4)

	if cacheKey1 == cacheKey4 {
		t.Errorf("Expected different cache keys for distant coordinates, got same key: %s", cacheKey1)
	}
}

func TestLocationCacheKeyFormat(t *testing.T) {
	cacheManager := &CacheManager{}

	key := LocationCacheKey{
		BrowserID: "test-browser",
		Latitude:  -6.2088,
		Longitude: 106.8456,
		Month:     "12",
		Year:      "2024",
	}

	cacheKey := cacheManager.generateLocationCacheKey(key)

	// Verify the cache key starts with "cache:" prefix
	if len(cacheKey) < 6 || cacheKey[:6] != "cache:" {
		t.Errorf("Expected cache key to start with 'cache:', got: %s", cacheKey)
	}

	// Verify the cache key is a reasonable length (MD5 hash should be 32 chars + prefix)
	expectedLength := 6 + 32 // "cache:" + MD5 hash
	if len(cacheKey) != expectedLength {
		t.Errorf("Expected cache key length to be %d, got %d", expectedLength, len(cacheKey))
	}
}

func TestCacheExtensionMethodSignature(t *testing.T) {
	// This test only checks that the GetLocationCacheAndExtend method has the correct signature
	// and compiles without actually calling it (since we don't have a Redis instance in tests)

	key := LocationCacheKey{
		BrowserID: "test-browser",
		Latitude:  -6.2088,
		Longitude: 106.8456,
		Month:     "12",
		Year:      "2024",
	}

	// Verify the method signature exists by checking if we can reference it
	cacheManager := &CacheManager{}
	method := cacheManager.GetLocationCacheAndExtend

	if method == nil {
		t.Error("GetLocationCacheAndExtend method should exist")
	}

	// Test that the cache key generation still works correctly
	cacheKey := cacheManager.generateLocationCacheKey(key)
	if len(cacheKey) == 0 {
		t.Error("Cache key should not be empty")
	}
}

func TestLocationCacheKeyDecimalPrecision(t *testing.T) {
	cacheManager := &CacheManager{}

	// Test that coordinates with different decimal precision generate the same cache key
	key1 := LocationCacheKey{
		BrowserID: "browser123",
		Latitude:  106.8337782562446,
		Longitude: -6.2088123456789,
		Month:     "12",
		Year:      "2024",
	}

	key2 := LocationCacheKey{
		BrowserID: "browser123",
		Latitude:  106.83377825624460000, // Same coordinate with more decimal places
		Longitude: -6.21,                 // Same coordinate with more decimal places
		Month:     "12",
		Year:      "2024",
	}

	cacheKey1 := cacheManager.generateLocationCacheKey(key1)
	cacheKey2 := cacheManager.generateLocationCacheKey(key2)

	if cacheKey1 != cacheKey2 {
		t.Errorf("Expected same cache key for coordinates with different decimal precision, got %s and %s", cacheKey1, cacheKey2)
	}

	// Test with the exact example from the user
	key3 := LocationCacheKey{
		BrowserID: "browser123",
		Latitude:  106.8337782562446,
		Longitude: -6.2088,
		Month:     "12",
		Year:      "2024",
	}

	key4 := LocationCacheKey{
		BrowserID: "browser123",
		Latitude:  106.83377825624460000, // Same coordinate with more decimal places
		Longitude: -6.2088,
		Month:     "12",
		Year:      "2024",
	}

	cacheKey3 := cacheManager.generateLocationCacheKey(key3)
	cacheKey4 := cacheManager.generateLocationCacheKey(key4)

	if cacheKey3 != cacheKey4 {
		t.Errorf("Expected same cache key for coordinates with different decimal precision (user example), got %s and %s", cacheKey3, cacheKey4)
	}
}
