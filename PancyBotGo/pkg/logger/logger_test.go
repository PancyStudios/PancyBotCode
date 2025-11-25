package logger

import (
	"os"
	"path/filepath"
	"sync"
	"testing"
)

func TestNewLogger(t *testing.T) {
	// Create a new logger without webhooks
	l := NewLogger("", "")
	if l == nil {
		t.Fatal("Expected logger to be created, got nil")
	}

	// Test that logger methods don't panic
	l.Info("Test info message", "TEST")
	l.Warn("Test warning message", "TEST")
	l.Debug("Test debug message", "TEST")
	l.System("Test system message", "TEST")
	l.Success("Test success message", "TEST")

	l.Close()
}

func TestLogLevelString(t *testing.T) {
	tests := []struct {
		level    LogLevel
		expected string
	}{
		{LevelCritical, "CRITICAL"},
		{LevelError, "ERROR"},
		{LevelWarn, "WARN"},
		{LevelSuccess, "SUCCESS"},
		{LevelInfo, "INFO"},
		{LevelDebug, "DEBUG"},
		{LevelSystem, "SYSTEM"},
	}

	for _, tt := range tests {
		t.Run(tt.expected, func(t *testing.T) {
			if got := tt.level.String(); got != tt.expected {
				t.Errorf("LogLevel.String() = %v, want %v", got, tt.expected)
			}
		})
	}
}

func TestLogLevelColor(t *testing.T) {
	levels := []LogLevel{
		LevelCritical,
		LevelError,
		LevelWarn,
		LevelSuccess,
		LevelInfo,
		LevelDebug,
		LevelSystem,
	}

	for _, level := range levels {
		t.Run(level.String(), func(t *testing.T) {
			color := level.Color()
			if color == "" {
				t.Error("Expected color to be non-empty")
			}
		})
	}
}

func TestLogLevelDiscordColor(t *testing.T) {
	tests := []struct {
		level LogLevel
		color int
	}{
		{LevelCritical, 0xFF0000},
		{LevelError, 0xFF0000},
		{LevelWarn, 0xFFFF00},
		{LevelSuccess, 0x00FF00},
		{LevelInfo, 0x0000FF},
		{LevelDebug, 0x800080},
		{LevelSystem, 0x808080},
	}

	for _, tt := range tests {
		t.Run(tt.level.String(), func(t *testing.T) {
			if got := tt.level.DiscordColor(); got != tt.color {
				t.Errorf("LogLevel.DiscordColor() = %v, want %v", got, tt.color)
			}
		})
	}
}

func TestLogFileCreation(t *testing.T) {
	// Clean up logs directory before test
	logsDir := filepath.Join(".", "logs")
	os.RemoveAll(logsDir)

	l := NewLogger("", "")
	defer l.Close()

	// Check that logs directory was created
	if _, err := os.Stat(logsDir); os.IsNotExist(err) {
		t.Error("Expected logs directory to be created")
	}

	// Check that log files were created
	combinedLog := filepath.Join(logsDir, "combined.log")
	errorLog := filepath.Join(logsDir, "error.log")

	if _, err := os.Stat(combinedLog); os.IsNotExist(err) {
		t.Error("Expected combined.log to be created")
	}

	if _, err := os.Stat(errorLog); os.IsNotExist(err) {
		t.Error("Expected error.log to be created")
	}
}

func TestGlobalLoggerInit(t *testing.T) {
	// Reset the global logger for this test
	logger = nil
	once = sync.Once{}

	l := Init("", "")
	if l == nil {
		t.Fatal("Expected Init to return a logger")
	}

	// Calling Init again should return the same logger
	l2 := Init("different", "different")
	if l != l2 {
		t.Error("Expected Init to return the same logger on subsequent calls")
	}

	// Get should return the same logger
	l3 := Get()
	if l != l3 {
		t.Error("Expected Get to return the same logger")
	}

	l.Close()
}
