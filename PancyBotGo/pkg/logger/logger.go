// Package logger provides a comprehensive logging system with multiple outputs.
// It supports console logging with colors, file logging, and Discord webhook logging.
package logger

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/sirupsen/logrus"
)

// LogLevel represents the severity level of a log message
type LogLevel int

const (
	LevelCritical LogLevel = iota
	LevelError
	LevelWarn
	LevelSuccess
	LevelInfo
	LevelDebug
	LevelSystem
)

// String returns the string representation of the log level
func (l LogLevel) String() string {
	switch l {
	case LevelCritical:
		return "CRITICAL"
	case LevelError:
		return "ERROR"
	case LevelWarn:
		return "WARN"
	case LevelSuccess:
		return "SUCCESS"
	case LevelInfo:
		return "INFO"
	case LevelDebug:
		return "DEBUG"
	case LevelSystem:
		return "SYSTEM"
	default:
		return "UNKNOWN"
	}
}

// Color returns the ANSI color code for the log level
func (l LogLevel) Color() string {
	switch l {
	case LevelCritical:
		return "\033[1;31m" // Bold Red
	case LevelError:
		return "\033[31m" // Red
	case LevelWarn:
		return "\033[33m" // Yellow
	case LevelSuccess:
		return "\033[32m" // Green
	case LevelInfo:
		return "\033[36m" // Cyan
	case LevelDebug:
		return "\033[35m" // Magenta
	case LevelSystem:
		return "\033[34m" // Blue
	default:
		return "\033[0m" // Reset
	}
}

// DiscordColor returns the Discord embed color for the log level
func (l LogLevel) DiscordColor() int {
	switch l {
	case LevelCritical, LevelError:
		return 0xFF0000 // Red
	case LevelWarn:
		return 0xFFFF00 // Yellow
	case LevelSuccess:
		return 0x00FF00 // Green
	case LevelInfo:
		return 0x0000FF // Blue
	case LevelDebug:
		return 0x800080 // Purple
	case LevelSystem:
		return 0x808080 // Grey
	default:
		return 0xFFFFFF // White
	}
}

const colorReset = "\033[0m"

// Logger is the main logging structure
type Logger struct {
	logrus          *logrus.Logger
	errorWebhookURL string
	logsWebhookURL  string
	logFile         *os.File
	errorFile       *os.File
	mu              sync.Mutex
}

// logger is the global logger instance
var logger *Logger
var once sync.Once

// Init initializes the global logger instance
func Init(errorWebhook, logsWebhook string) *Logger {
	once.Do(func() {
		logger = NewLogger(errorWebhook, logsWebhook)
	})
	return logger
}

// Get returns the global logger instance
func Get() *Logger {
	if logger == nil {
		logger = NewLogger("", "")
	}
	return logger
}

// NewLogger creates a new Logger instance
func NewLogger(errorWebhook, logsWebhook string) *Logger {
	l := &Logger{
		logrus:          logrus.New(),
		errorWebhookURL: errorWebhook,
		logsWebhookURL:  logsWebhook,
	}

	// Setup logrus
	l.logrus.SetFormatter(&logrus.TextFormatter{
		FullTimestamp:   true,
		TimestampFormat: "2006-01-02 15:04:05",
		DisableColors:   true,
	})
	l.logrus.SetOutput(io.Discard) // We handle output ourselves

	// Create logs directory
	logsDir := filepath.Join(".", "logs")
	if err := os.MkdirAll(logsDir, 0755); err != nil {
		fmt.Printf("Error creating logs directory: %v\n", err)
	}

	// Open log files
	var err error
	l.logFile, err = os.OpenFile(filepath.Join(logsDir, "combined.log"), os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		fmt.Printf("Error opening combined log file: %v\n", err)
	}

	l.errorFile, err = os.OpenFile(filepath.Join(logsDir, "error.log"), os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		fmt.Printf("Error opening error log file: %v\n", err)
	}

	return l
}

// log is the internal logging function
func (l *Logger) log(level LogLevel, message string, prefix string) {
	l.mu.Lock()
	defer l.mu.Unlock()

	timestamp := time.Now().Format("2006-01-02 15:04:05")

	// Console output with colors
	consoleMsg := fmt.Sprintf("[%s] [%s%s%s] [%s]: %s\n",
		timestamp,
		level.Color(),
		level.String(),
		colorReset,
		prefix,
		message,
	)
	fmt.Print(consoleMsg)

	// File output without colors
	fileMsg := fmt.Sprintf("[%s] [%s] [%s]: %s\n",
		timestamp,
		level.String(),
		prefix,
		message,
	)

	// Write to combined log
	if l.logFile != nil {
		l.logFile.WriteString(fileMsg)
	}

	// Write to error log if it's an error level
	if level <= LevelError && l.errorFile != nil {
		l.errorFile.WriteString(fileMsg)
	}

	// Send to Discord webhook
	go l.sendToWebhook(level, message, prefix)
}

// sendToWebhook sends the log message to the appropriate Discord webhook
func (l *Logger) sendToWebhook(level LogLevel, message, prefix string) {
	var webhookURL string

	if level <= LevelError && l.errorWebhookURL != "" {
		webhookURL = l.errorWebhookURL
	} else if l.logsWebhookURL != "" && level > LevelError {
		webhookURL = l.logsWebhookURL
	}

	if webhookURL == "" {
		return
	}

	embed := map[string]interface{}{
		"title":       fmt.Sprintf("[%s] %s", level.String(), prefix),
		"description": fmt.Sprintf("```%s```", message),
		"color":       level.DiscordColor(),
		"timestamp":   time.Now().Format(time.RFC3339),
		"footer": map[string]string{
			"text": "💫 Developed by PancyStudio | PancyBot Go",
		},
	}

	payload := map[string]interface{}{
		"embeds": []interface{}{embed},
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return
	}

	req, err := http.NewRequest("POST", webhookURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return
	}
	defer resp.Body.Close()
}

// Close closes the log files
func (l *Logger) Close() {
	if l.logFile != nil {
		l.logFile.Close()
	}
	if l.errorFile != nil {
		l.errorFile.Close()
	}
}

// Logging methods

// Critical logs a critical message
func (l *Logger) Critical(message string, prefix string) {
	l.log(LevelCritical, message, prefix)
}

// Error logs an error message
func (l *Logger) Error(message string, prefix string) {
	l.log(LevelError, message, prefix)
}

// Warn logs a warning message
func (l *Logger) Warn(message string, prefix string) {
	l.log(LevelWarn, message, prefix)
}

// Success logs a success message
func (l *Logger) Success(message string, prefix string) {
	l.log(LevelSuccess, message, prefix)
}

// Info logs an info message
func (l *Logger) Info(message string, prefix string) {
	l.log(LevelInfo, message, prefix)
}

// Debug logs a debug message
func (l *Logger) Debug(message string, prefix string) {
	l.log(LevelDebug, message, prefix)
}

// System logs a system message
func (l *Logger) System(message string, prefix string) {
	l.log(LevelSystem, message, prefix)
}

// Package-level functions for convenience

// Critical logs a critical message using the global logger
func Critical(message string, prefix string) {
	Get().Critical(message, prefix)
}

// Error logs an error message using the global logger
func Error(message string, prefix string) {
	Get().Error(message, prefix)
}

// Warn logs a warning message using the global logger
func Warn(message string, prefix string) {
	Get().Warn(message, prefix)
}

// Success logs a success message using the global logger
func Success(message string, prefix string) {
	Get().Success(message, prefix)
}

// Info logs an info message using the global logger
func Info(message string, prefix string) {
	Get().Info(message, prefix)
}

// Debug logs a debug message using the global logger
func Debug(message string, prefix string) {
	Get().Debug(message, prefix)
}

// System logs a system message using the global logger
func System(message string, prefix string) {
	Get().System(message, prefix)
}
