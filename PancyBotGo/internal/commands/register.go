// Package commands provides a registry for organizing bot commands.
// Commands are organized in subdirectories by category (util, music, mod, etc.)
package commands

import (
	"github.com/PancyStudios/PancyBotCode/PancyBotGo/pkg/discord"
)

// RegisterAll registers all commands with the Discord client
// Add your command registration calls here
func RegisterAll(client *discord.ExtendedClient) {
	// Utility commands
	RegisterUtilCommands(client)

	// Music commands
	RegisterMusicCommands(client)

	// Add more categories here as needed:
	// RegisterModCommands(client)
	// RegisterFunCommands(client)
}
