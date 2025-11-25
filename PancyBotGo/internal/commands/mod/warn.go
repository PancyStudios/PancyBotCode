// Package mod - /mod warn command
package mod

import (
	"fmt"

	"github.com/PancyStudios/PancyBotCode/PancyBotGo/pkg/discord"
	"github.com/bwmarrin/discordgo"
)

// createWarnCommand creates the /mod warn subcommand
func createWarnCommand() *discord.Command {
	return discord.NewCommand(
		"warn",
		"Advierte a un usuario",
		"mod",
		warnHandler,
	).WithOptions(
		&discordgo.ApplicationCommandOption{
			Type:        discordgo.ApplicationCommandOptionUser,
			Name:        "usuario",
			Description: "Usuario a advertir",
			Required:    true,
		},
		&discordgo.ApplicationCommandOption{
			Type:        discordgo.ApplicationCommandOptionString,
			Name:        "razon",
			Description: "Razón de la advertencia",
			Required:    true,
		},
	).WithUserPermissions(discordgo.PermissionModerateMembers)
}

// warnHandler handles the /mod warn command
func warnHandler(ctx *discord.CommandContext) error {
	user := ctx.GetUserOption("usuario")
	if user == nil {
		return ctx.ReplyEphemeral("❌ Debes especificar un usuario.")
	}

	reason := ctx.GetStringOption("razon")
	if reason == "" {
		return ctx.ReplyEphemeral("❌ Debes especificar una razón.")
	}

	// Here you would typically save the warning to the database
	// For now, we just send a message

	return ctx.Reply(fmt.Sprintf("⚠️ **%s** ha sido advertido.\n**Razón:** %s\n**Moderador:** %s",
		user.Username,
		reason,
		ctx.User().Username,
	))
}
