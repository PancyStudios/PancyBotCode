// Package web provides API routes for the web server.
package web

import (
	"net/http"

	"github.com/PancyStudios/PancyBotCode/PancyBotGo/pkg/database"
	"github.com/PancyStudios/PancyBotCode/PancyBotGo/pkg/discord"
	"github.com/gin-gonic/gin"
)

// SetupAPIRoutes sets up the API routes
func SetupAPIRoutes(s *Server) {
	api := s.Group("/api")
	{
		api.GET("/status", statusHandler)
		api.GET("/health", healthHandler)
		api.GET("/bot", botInfoHandler)
	}
}

// statusHandler returns the bot and database status
func statusHandler(c *gin.Context) {
	db := database.Get()
	client := discord.Get()

	dbStatus, dbOnline := db.GetStatus()

	botOnline := false
	if client != nil {
		botOnline = client.IsReady()
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
		"database": gin.H{
			"status":   dbStatus,
			"isOnline": dbOnline,
		},
		"bot": gin.H{
			"isOnline": botOnline,
		},
	})
}

// healthHandler returns a simple health check response
func healthHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "healthy",
		"message": "PancyBot Go is running",
	})
}

// botInfoHandler returns information about the bot
func botInfoHandler(c *gin.Context) {
	client := discord.Get()

	if client == nil || !client.IsReady() {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error":   "Bot Offline",
			"message": "El bot no está disponible en este momento.",
		})
		return
	}

	user := client.Session.State.User

	c.JSON(http.StatusOK, gin.H{
		"id":            user.ID,
		"username":      user.Username,
		"discriminator": user.Discriminator,
		"avatar":        user.Avatar,
		"guilds":        client.GuildCount(),
		"isReady":       client.IsReady(),
	})
}
