// Package commands provides a registry for organizing bot commands.
// Commands are organized in subdirectories by category (util, music, mod, etc.)
package commands

import (
	"github.com/PancyStudios/PancyBotCode/PancyBotGo/internal/commands/mod"
	"github.com/PancyStudios/PancyBotCode/PancyBotGo/pkg/discord"
)

// RegisterAll registers all commands with the Discord client
// Add your command registration calls here
func RegisterAll(client *discord.ExtendedClient) {
	// Utility commands
	RegisterUtilCommands(client)

	// Music commands
	RegisterMusicCommands(client)

	// Moderation commands (/mod ban, /mod kick, /mod warn, /mod mute)
	mod.RegisterModCommands(client)

	// Add more categories here as needed:
	// RegisterFunCommands(client)
}
