// Package web provides an HTTP server with routing and middleware.
// It uses Gin framework for high-performance web handling.
package web

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"time"

	"github.com/PancyStudios/PancyBotCode/PancyBotGo/pkg/logger"
	"github.com/gin-gonic/gin"
)

// Server represents the web server
type Server struct {
	engine          *gin.Engine
	webhookURL      string
	allowedHostRegex *regexp.Regexp
}

var (
	server *Server
)

// Init initializes the global web server
func Init(webhookURL string) *Server {
	server = NewServer(webhookURL)
	return server
}

// Get returns the global web server
func Get() *Server {
	return server
}

// NewServer creates a new web server
func NewServer(webhookURL string) *Server {
	gin.SetMode(gin.ReleaseMode)

	engine := gin.New()
	engine.Use(gin.Recovery())

	s := &Server{
		engine:          engine,
		webhookURL:      webhookURL,
		allowedHostRegex: regexp.MustCompile(`^(.+\.)?miau\.media`),
	}

	// Apply middlewares
	s.engine.Use(s.logsMiddleware())
	s.engine.Use(s.rateLimitMiddleware())

	// Set up error handlers
	s.setupErrorHandlers()

	return s
}

// Engine returns the underlying Gin engine
func (s *Server) Engine() *gin.Engine {
	return s.engine
}

// logsMiddleware logs all incoming requests to the webhook
func (s *Server) logsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		host := c.Request.Host

		if s.allowedHostRegex.MatchString(host) {
			logger.Info(fmt.Sprintf("[LOG] Nueva solicitud: %s %s", c.Request.Method, c.Request.URL.Path), "WebServer")

			// Send to webhook
			go s.sendLogToWebhook(c, false)

			c.Next()
		} else {
			logger.Warn(fmt.Sprintf("[LOG] Solicitud Sospechosa: %s %s | %s", c.Request.Method, c.Request.URL.Path, c.ClientIP()), "WebServer")

			// Send suspicious request to webhook
			go s.sendLogToWebhook(c, true)

			c.AbortWithStatus(http.StatusForbidden)
		}
	}
}

// sendLogToWebhook sends a log message to the Discord webhook
func (s *Server) sendLogToWebhook(c *gin.Context, suspicious bool) {
	if s.webhookURL == "" {
		return
	}

	title := fmt.Sprintf("💫 | Nueva solicitud al servidor web de tipo %s", c.Request.Method)
	color := 0x00AE86 // Green

	if suspicious {
		title = fmt.Sprintf("💫 | Solicitud Sospechosa Rechazada: %s %s", c.Request.Method, c.Request.URL.Path)
		color = 0xFFA500 // Orange
	}

	headers, _ := json.Marshal(c.Request.Header)
	query := c.Request.URL.RawQuery
	if query == "" {
		query = "{}"
	}

	embed := map[string]interface{}{
		"title": title,
		"description": fmt.Sprintf(
			"> **Ruta:** `%s`\n> **IP:** `%s`\n> **Headers:** ```%s``` \n> **Query:** ```%s```",
			c.Request.URL.Path,
			c.ClientIP(),
			string(headers),
			query,
		),
		"color":     color,
		"timestamp": time.Now().Format(time.RFC3339),
	}

	payload := map[string]interface{}{
		"embeds": []interface{}{embed},
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return
	}

	req, err := http.NewRequest("POST", s.webhookURL, bytes.NewBuffer(jsonData))
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

// RateLimitConfig holds rate limiting configuration
type RateLimitConfig struct {
	WindowMs   time.Duration
	MaxRequests int
}

// rateLimitMiddleware implements a simple rate limiter
func (s *Server) rateLimitMiddleware() gin.HandlerFunc {
	// Simple in-memory rate limiter
	type clientInfo struct {
		count    int
		resetAt  time.Time
	}
	clients := make(map[string]*clientInfo)

	config := RateLimitConfig{
		WindowMs:   60 * time.Second,
		MaxRequests: 100,
	}

	return func(c *gin.Context) {
		ip := c.ClientIP()
		now := time.Now()

		info, exists := clients[ip]
		if !exists || now.After(info.resetAt) {
			clients[ip] = &clientInfo{
				count:   1,
				resetAt: now.Add(config.WindowMs),
			}
			c.Next()
			return
		}

		info.count++
		if info.count > config.MaxRequests {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Demasiadas solicitudes, por favor intente de nuevo más tarde.",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// setupErrorHandlers sets up error handling routes
func (s *Server) setupErrorHandlers() {
	// 404 handler
	s.engine.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Not Found",
			"message": "La ruta solicitada no existe.",
			"status":  404,
		})
	})

	// 405 handler
	s.engine.NoMethod(func(c *gin.Context) {
		c.JSON(http.StatusMethodNotAllowed, gin.H{
			"error":   "Method Not Allowed",
			"message": "El método HTTP no está permitido para esta ruta.",
			"status":  405,
		})
	})
}

// Start starts the web server
func (s *Server) Start(port string) error {
	logger.Info(fmt.Sprintf("🚀 Servidor escuchando en http://localhost:%s", port), "WebServer")
	return s.engine.Run(":" + port)
}

// StartAsync starts the web server in a goroutine
func (s *Server) StartAsync(port string) {
	go func() {
		if err := s.Start(port); err != nil {
			logger.Error(fmt.Sprintf("Error starting web server: %v", err), "WebServer")
		}
	}()
}

// Router helper methods

// GET registers a GET route
func (s *Server) GET(path string, handlers ...gin.HandlerFunc) {
	s.engine.GET(path, handlers...)
}

// POST registers a POST route
func (s *Server) POST(path string, handlers ...gin.HandlerFunc) {
	s.engine.POST(path, handlers...)
}

// PUT registers a PUT route
func (s *Server) PUT(path string, handlers ...gin.HandlerFunc) {
	s.engine.PUT(path, handlers...)
}

// DELETE registers a DELETE route
func (s *Server) DELETE(path string, handlers ...gin.HandlerFunc) {
	s.engine.DELETE(path, handlers...)
}

// PATCH registers a PATCH route
func (s *Server) PATCH(path string, handlers ...gin.HandlerFunc) {
	s.engine.PATCH(path, handlers...)
}

// Group creates a new router group
func (s *Server) Group(path string, handlers ...gin.HandlerFunc) *gin.RouterGroup {
	return s.engine.Group(path, handlers...)
}

// Static serves static files
func (s *Server) Static(path, root string) {
	s.engine.Static(path, root)
}

// LoadHTMLGlob loads HTML templates
func (s *Server) LoadHTMLGlob(pattern string) {
	s.engine.LoadHTMLGlob(pattern)
}
