// Package main is the entry point for the PancyBot Go application.
// It initializes all systems and starts the Discord bot.
package main

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/PancyStudios/PancyBotCode/PancyBotGo/pkg/config"
	"github.com/PancyStudios/PancyBotCode/PancyBotGo/pkg/database"
	"github.com/PancyStudios/PancyBotCode/PancyBotGo/pkg/discord"
	"github.com/PancyStudios/PancyBotCode/PancyBotGo/pkg/errors"
	"github.com/PancyStudios/PancyBotCode/PancyBotGo/pkg/logger"
	"github.com/PancyStudios/PancyBotCode/PancyBotGo/pkg/mqtt"
	"github.com/PancyStudios/PancyBotCode/PancyBotGo/pkg/web"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		fmt.Printf("Error loading configuration: %v\n", err)
		os.Exit(1)
	}

	// Initialize logger
	log := logger.Init(cfg.ErrorWebhook, cfg.LogsWebhook)
	defer log.Close()

	logger.System("Iniciando PancyBot Go...", "Main")
	logger.Info(fmt.Sprintf("Directorio de trabajo: %s", getCurrentDir()), "Main")

	// Initialize error handler
	var discordClient *discord.ExtendedClient
	errors.Init(cfg.ErrorWebhook, func() {
		if discordClient != nil {
			discordClient.Stop()
		}
	})

	// Initialize database
	db, err := database.Init(cfg.MongoDBURL, cfg.DBName)
	if err != nil {
		logger.Error(fmt.Sprintf("Error connecting to database: %v", err), "Main")
		// Continue without database - it will attempt to reconnect
	}
	defer func() {
		if db != nil {
			db.Disconnect()
		}
	}()

	// Initialize MQTT
	mqttClientID := "pancybot"
	if !cfg.IsProd() {
		mqttClientID = "pancybot_canary"
	}

	mqttClient := mqtt.Init(
		cfg.MQTTHost,
		cfg.MQTTPort,
		cfg.MQTTUser,
		cfg.MQTTPassword,
		mqttClientID,
	)
	defer mqttClient.Destroy()

	// Initialize web server
	webServer := web.Init(cfg.LogsWebServerHook)
	web.SetupAPIRoutes(webServer)
	webServer.StartAsync(cfg.Port)

	// Initialize Discord client
	discordClient, err = discord.Init(cfg.BotToken)
	if err != nil {
		logger.Critical(fmt.Sprintf("Error creating Discord client: %v", err), "Main")
		os.Exit(1)
	}

	// Register example commands
	registerCommands(discordClient)

	// Start the bot
	if err := discordClient.Start(); err != nil {
		logger.Critical(fmt.Sprintf("Error starting Discord client: %v", err), "Main")
		os.Exit(1)
	}
	defer discordClient.Stop()

	logger.Success("PancyBot Go iniciado correctamente!", "Main")

	// Wait for interrupt signal
	sc := make(chan os.Signal, 1)
	signal.Notify(sc, syscall.SIGINT, syscall.SIGTERM, os.Interrupt)
	<-sc

	logger.System("Apagando PancyBot Go...", "Main")
}

// getCurrentDir returns the current working directory
func getCurrentDir() string {
	dir, err := os.Getwd()
	if err != nil {
		return "unknown"
	}
	return dir
}

// registerCommands registers all bot commands
func registerCommands(client *discord.ExtendedClient) {
	// Example ping command
	pingCmd := discord.NewCommand(
		"ping",
		"Comprueba la latencia del bot",
		"util",
		func(ctx *discord.CommandContext) error {
			latency := ctx.Client.Session.HeartbeatLatency().Milliseconds()
			return ctx.Reply(fmt.Sprintf("🏓 Pong! Latencia: %dms", latency))
		},
	)

	client.CommandHandler.RegisterCommand(pingCmd)
	client.CommandHandler.AddGlobalCommand(pingCmd.ToApplicationCommand())

	// Example status command
	statusCmd := discord.NewCommand(
		"status",
		"Muestra el estado del bot",
		"util",
		func(ctx *discord.CommandContext) error {
			db := database.Get()
			dbStatus, _ := db.GetStatus()

			return ctx.Reply(fmt.Sprintf(
				"📊 **Estado del Bot**\n"+
					"• Bot: 🟢 Online\n"+
					"• Base de datos: %s\n"+
					"• Servidores: %d",
				dbStatus,
				ctx.Client.GuildCount(),
			))
		},
	)

	client.CommandHandler.RegisterCommand(statusCmd)
	client.CommandHandler.AddGlobalCommand(statusCmd.ToApplicationCommand())

	logger.System(fmt.Sprintf("Registrados %d comandos", client.Commands.Size()), "Main")
}
