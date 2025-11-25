// Package mod provides moderation commands organized as subcommands under /mod
// Each command is in its own file for better organization
package mod

import (
	"github.com/PancyStudios/PancyBotCode/PancyBotGo/pkg/discord"
)

// RegisterModCommands registers all moderation commands as /mod subcommands
func RegisterModCommands(client *discord.ExtendedClient) {
	// Create individual subcommands (each can be in its own file)
	banCmd := createBanCommand()
	kickCmd := createKickCommand()
	warnCmd := createWarnCommand()
	muteCmd := createMuteCommand()

	// Build the /mod command group with all subcommands
	modGroup := client.CommandHandler.BuildCommandGroup(
		"mod",
		"Comandos de moderación",
		banCmd,
		kickCmd,
		warnCmd,
		muteCmd,
	)

	// Register the command group
	client.CommandHandler.AddGlobalCommand(modGroup)
}
