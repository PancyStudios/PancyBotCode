// Package errors provides error handling and recovery mechanisms for the bot.
// It implements an error counter with automatic shutdown on excessive errors.
package errors

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"sync"
	"sync/atomic"
	"time"

	"github.com/PancyStudios/PancyBotCode/PancyBotGo/pkg/logger"
)

// ErrorHandler manages error counting and reporting
type ErrorHandler struct {
	errorCount     int32
	webhookURL     string
	mu             sync.Mutex
	stopChan       chan struct{}
	shutdownFunc   func()
	maxErrors      int32
	resetInterval  time.Duration
	checkInterval  time.Duration
}

// ReportErrorOptions contains options for reporting an error
type ReportErrorOptions struct {
	Error   string
	Message string
}

var (
	handler *ErrorHandler
	once    sync.Once
)

// Init initializes the global error handler
func Init(webhookURL string, shutdownFunc func()) *ErrorHandler {
	once.Do(func() {
		handler = NewErrorHandler(webhookURL, shutdownFunc)
	})
	return handler
}

// Get returns the global error handler instance
func Get() *ErrorHandler {
	return handler
}

// NewErrorHandler creates a new ErrorHandler instance
func NewErrorHandler(webhookURL string, shutdownFunc func()) *ErrorHandler {
	h := &ErrorHandler{
		errorCount:    0,
		webhookURL:    webhookURL,
		stopChan:      make(chan struct{}),
		shutdownFunc:  shutdownFunc,
		maxErrors:     15,
		resetInterval: 5 * time.Second,
		checkInterval: 1 * time.Second,
	}

	h.start()
	return h
}

// start begins the error monitoring goroutines
func (h *ErrorHandler) start() {
	// Error reset goroutine - resets error count every 5 seconds
	go func() {
		ticker := time.NewTicker(h.resetInterval)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				atomic.StoreInt32(&h.errorCount, 0)
			case <-h.stopChan:
				return
			}
		}
	}()

	// Error check goroutine - checks for excessive errors
	go func() {
		ticker := time.NewTicker(h.checkInterval)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				if atomic.LoadInt32(&h.errorCount) > h.maxErrors {
					start := time.Now()
					logger.Warn("Se detectó un número demasiado alto de errores", "CRITICAL")
					logger.Warn("Apagando...", "CRITICAL")

					h.Report(ReportErrorOptions{
						Error:   "Critical Error",
						Message: "Número inusual de errores. Apagando...",
					})

					if h.shutdownFunc != nil {
						h.shutdownFunc()
					}

					elapsed := time.Since(start)
					logger.Warn(fmt.Sprintf("Finalizando proceso... Tiempo total: %v", elapsed), "CRITICAL")
					os.Exit(1)
				}
			case <-h.stopChan:
				return
			}
		}
	}()
}

// Stop stops the error monitoring goroutines
func (h *ErrorHandler) Stop() {
	close(h.stopChan)
}

// IncrementError increments the error count
func (h *ErrorHandler) IncrementError() {
	count := atomic.AddInt32(&h.errorCount, 1)
	logger.Error(fmt.Sprintf("Error count: %d", count), "AntiCrash")
}

// HandlePanic handles a recovered panic
func (h *ErrorHandler) HandlePanic(recovered interface{}) {
	h.IncrementError()
	logger.Debug("Unhandled Panic/Catch", "AntiCrash")
	logger.Error(fmt.Sprintf("%v", recovered), "SYS")
}

// Report sends an error report to the Discord webhook
func (h *ErrorHandler) Report(data ReportErrorOptions) {
	if h.webhookURL == "" {
		return
	}

	embed := map[string]interface{}{
		"author": map[string]string{
			"name": fmt.Sprintf("Error %s", data.Error),
		},
		"description": data.Message,
		"color":       0xFF0000, // Red
		"footer": map[string]string{
			"text": "PancyBot Go",
		},
		"timestamp": time.Now().Format(time.RFC3339),
	}

	payload := map[string]interface{}{
		"embeds": []interface{}{embed},
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		logger.Error(fmt.Sprintf("Failed to marshal error report: %v", err), "AntiCrash")
		return
	}

	req, err := http.NewRequest("POST", h.webhookURL, bytes.NewBuffer(jsonData))
	if err != nil {
		logger.Error(fmt.Sprintf("Failed to create webhook request: %v", err), "AntiCrash")
		return
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		logger.Error(fmt.Sprintf("Failed to send error report: %v", err), "AntiCrash")
		return
	}
	defer resp.Body.Close()

	logger.Warn(fmt.Sprintf("Sent ErrorReport to Webhook, Status: %d", resp.StatusCode), "AntiCrash")
}

// RecoverMiddleware returns a recovery function for use in deferred calls
func RecoverMiddleware() func() {
	return func() {
		if r := recover(); r != nil {
			if handler != nil {
				handler.HandlePanic(r)
			} else {
				logger.Error(fmt.Sprintf("Panic recovered (no handler): %v", r), "AntiCrash")
			}
		}
	}
}
