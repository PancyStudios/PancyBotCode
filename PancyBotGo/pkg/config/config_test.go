package config

import (
	"os"
	"testing"
)

func TestLoad(t *testing.T) {
	// Set up test environment variables
	os.Setenv("botToken", "test-token")
	os.Setenv("PORT", "3001")
	os.Setenv("enviroment", "test")
	defer func() {
		os.Unsetenv("botToken")
		os.Unsetenv("PORT")
		os.Unsetenv("enviroment")
	}()

	// Reset global config
	cfg = nil

	config, err := Load()
	if err != nil {
		t.Fatalf("Load() returned error: %v", err)
	}

	if config.BotToken != "test-token" {
		t.Errorf("BotToken = %v, want %v", config.BotToken, "test-token")
	}

	if config.Port != "3001" {
		t.Errorf("Port = %v, want %v", config.Port, "3001")
	}

	if config.Environment != "test" {
		t.Errorf("Environment = %v, want %v", config.Environment, "test")
	}
}

func TestGetEnv(t *testing.T) {
	os.Setenv("TEST_VAR", "test-value")
	defer os.Unsetenv("TEST_VAR")

	if got := getEnv("TEST_VAR", "default"); got != "test-value" {
		t.Errorf("getEnv() = %v, want %v", got, "test-value")
	}

	if got := getEnv("NON_EXISTENT_VAR", "default"); got != "default" {
		t.Errorf("getEnv() = %v, want %v", got, "default")
	}
}

func TestIsProd(t *testing.T) {
	cfg = nil
	os.Setenv("enviroment", "prod")
	config, _ := Load()

	if !config.IsProd() {
		t.Error("IsProd() should return true when environment is 'prod'")
	}

	cfg = nil
	os.Setenv("enviroment", "dev")
	config, _ = Load()

	if config.IsProd() {
		t.Error("IsProd() should return false when environment is not 'prod'")
	}

	os.Unsetenv("enviroment")
}

func TestGet(t *testing.T) {
	cfg = nil

	// Get should create a new config if none exists
	config := Get()
	if config == nil {
		t.Fatal("Get() returned nil")
	}

	// Get should return the same config on subsequent calls
	config2 := Get()
	if config != config2 {
		t.Error("Get() should return the same config on subsequent calls")
	}
}

func TestDefaultValues(t *testing.T) {
	// Clear all environment variables
	os.Unsetenv("botToken")
	os.Unsetenv("devGuildId")
	os.Unsetenv("mongodbUrl")
	os.Unsetenv("dbName")
	os.Unsetenv("MQTT_Host")
	os.Unsetenv("MQTT_Port")
	os.Unsetenv("PORT")
	os.Unsetenv("enviroment")

	cfg = nil
	config, _ := Load()

	// Check default values
	if config.MongoDBURL != "mongodb://localhost:27017" {
		t.Errorf("MongoDBURL default = %v, want %v", config.MongoDBURL, "mongodb://localhost:27017")
	}

	if config.DBName != "PancyBot" {
		t.Errorf("DBName default = %v, want %v", config.DBName, "PancyBot")
	}

	if config.MQTTHost != "localhost" {
		t.Errorf("MQTTHost default = %v, want %v", config.MQTTHost, "localhost")
	}

	if config.MQTTPort != "1883" {
		t.Errorf("MQTTPort default = %v, want %v", config.MQTTPort, "1883")
	}

	if config.Port != "3000" {
		t.Errorf("Port default = %v, want %v", config.Port, "3000")
	}

	if config.Environment != "dev" {
		t.Errorf("Environment default = %v, want %v", config.Environment, "dev")
	}
}
