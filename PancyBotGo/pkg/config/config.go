// Package config provides configuration management for the bot.
// It loads environment variables and makes them available throughout the application.
package config

import (
	"os"

	"github.com/joho/godotenv"
)

// Config holds all configuration values for the bot
type Config struct {
	// Discord
	BotToken   string
	DevGuildID string

	// MongoDB
	MongoDBURL string
	DBName     string

	// MQTT
	MQTTHost     string
	MQTTPort     string
	MQTTUser     string
	MQTTPassword string

	// Web Server
	Port string

	// Environment
	Environment string

	// Webhooks
	ErrorWebhook      string
	LogsWebhook       string
	LogsWebServerHook string

	// Lavalink
	LinkServer   string
	LinkPassword string
}

// cfg holds the global configuration instance
var cfg *Config

// Load initializes the configuration from environment variables
func Load() (*Config, error) {
	// Load .env file if it exists (ignoring error if it doesn't)
	_ = godotenv.Load()

	cfg = &Config{
		// Discord
		BotToken:   getEnv("botToken", ""),
		DevGuildID: getEnv("devGuildId", ""),

		// MongoDB
		MongoDBURL: getEnv("mongodbUrl", "mongodb://localhost:27017"),
		DBName:     getEnv("dbName", "PancyBot"),

		// MQTT
		MQTTHost:     getEnv("MQTT_Host", "localhost"),
		MQTTPort:     getEnv("MQTT_Port", "1883"),
		MQTTUser:     getEnv("MQTT_User", ""),
		MQTTPassword: getEnv("MQTT_Password", ""),

		// Web Server
		Port: getEnv("PORT", "3000"),

		// Environment
		Environment: getEnv("enviroment", "dev"),

		// Webhooks
		ErrorWebhook:      getEnv("errorWebhook", ""),
		LogsWebhook:       getEnv("logsWebhook", ""),
		LogsWebServerHook: getEnv("logsWebServerWebhook", ""),

		// Lavalink
		LinkServer:   getEnv("linkserver", "localhost"),
		LinkPassword: getEnv("linkpassword", ""),
	}

	return cfg, nil
}

// Get returns the current configuration
func Get() *Config {
	if cfg == nil {
		cfg, _ = Load()
	}
	return cfg
}

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// IsProd returns true if the environment is production
func (c *Config) IsProd() bool {
	return c.Environment == "prod"
}
