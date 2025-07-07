package redis

import (
	"testing"
)

func TestNewRedis(t *testing.T) {
	// Test that NewRedis returns a non-nil client
	client := NewRedis()
	if client == nil {
		t.Error("NewRedis should return a non-nil client")
	}

	// Test that the client has the expected configuration
	// Note: We can't easily test the internal configuration without exposing it,
	// but we can verify the client is properly initialized
	if client.Options().Addr != "muslimboard-redis:6379" {
		t.Errorf("Expected Redis address to be 'muslimboard-redis:6379', got: %s", client.Options().Addr)
	}

	if client.Options().Password != "" {
		t.Errorf("Expected Redis password to be empty, got: %s", client.Options().Password)
	}

	if client.Options().DB != 0 {
		t.Errorf("Expected Redis DB to be 0, got: %d", client.Options().DB)
	}
}
