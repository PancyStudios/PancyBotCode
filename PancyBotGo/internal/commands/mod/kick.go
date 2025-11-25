// Package mod - /mod kick command
package mod

import (
	"fmt"

	"github.com/PancyStudios/PancyBotCode/PancyBotGo/pkg/discord"
	"github.com/bwmarrin/discordgo"
)

// createKickCommand creates the /mod kick subcommand
func createKickCommand() *discord.Command {
	return discord.NewCommand(
		"kick",
		"Expulsa a un usuario del servidor",
		"mod",
		kickHandler,
	).WithOptions(
		&discordgo.ApplicationCommandOption{
			Type:        discordgo.ApplicationCommandOptionUser,
			Name:        "usuario",
			Description: "Usuario a expulsar",
			Required:    true,
		},
		&discordgo.ApplicationCommandOption{
			Type:        discordgo.ApplicationCommandOptionString,
			Name:        "razon",
			Description: "Razón de la expulsión",
			Required:    false,
		},
	).WithUserPermissions(discordgo.PermissionKickMembers).
		WithBotPermissions(discordgo.PermissionKickMembers)
}

// kickHandler handles the /mod kick command
func kickHandler(ctx *discord.CommandContext) error {
	user := ctx.GetUserOption("usuario")
	if user == nil {
		return ctx.ReplyEphemeral("❌ Debes especificar un usuario.")
	}

	reason := ctx.GetStringOption("razon")
	if reason == "" {
		reason = "Sin razón especificada"
	}

	// Perform the kick
	err := ctx.Session.GuildMemberDeleteWithReason(
		ctx.Interaction.GuildID,
		user.ID,
		reason,
	)
	if err != nil {
		return ctx.ReplyEphemeral(fmt.Sprintf("❌ Error al expulsar: %v", err))
	}

	return ctx.Reply(fmt.Sprintf("👢 **%s** ha sido expulsado.\n**Razón:** %s", user.Username, reason))
}
