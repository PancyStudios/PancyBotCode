// Package commands provides utility commands for the bot.
package commands

import (
	"fmt"

	"github.com/PancyStudios/PancyBotCode/PancyBotGo/pkg/database"
	"github.com/PancyStudios/PancyBotCode/PancyBotGo/pkg/discord"
)

// RegisterUtilCommands registers all utility commands
func RegisterUtilCommands(client *discord.ExtendedClient) {
	// Ping command
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

	// Status command
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

	// Help command
	helpCmd := discord.NewCommand(
		"help",
		"Muestra información de ayuda",
		"util",
		func(ctx *discord.CommandContext) error {
			return ctx.Reply(
				"📖 **Ayuda de PancyBot Go**\n\n" +
					"**Comandos disponibles:**\n" +
					"• `/ping` - Comprueba la latencia\n" +
					"• `/status` - Estado del bot\n" +
					"• `/play <query>` - Reproduce música\n" +
					"• `/pause` - Pausa/resume la música\n" +
					"• `/skip` - Salta la canción actual\n" +
					"• `/stop` - Detiene la música\n" +
					"• `/queue` - Muestra la cola\n" +
					"• `/volume <0-100>` - Ajusta el volumen",
			)
		},
	)
	client.CommandHandler.RegisterCommand(helpCmd)
	client.CommandHandler.AddGlobalCommand(helpCmd.ToApplicationCommand())
}
