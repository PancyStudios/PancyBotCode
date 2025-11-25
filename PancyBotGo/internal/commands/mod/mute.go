// Package mod - /mod mute command
package mod

import (
	"fmt"
	"time"

	"github.com/PancyStudios/PancyBotCode/PancyBotGo/pkg/discord"
	"github.com/bwmarrin/discordgo"
)

// createMuteCommand creates the /mod mute subcommand
func createMuteCommand() *discord.Command {
	return discord.NewCommand(
		"mute",
		"Silencia a un usuario temporalmente",
		"mod",
		muteHandler,
	).WithOptions(
		&discordgo.ApplicationCommandOption{
			Type:        discordgo.ApplicationCommandOptionUser,
			Name:        "usuario",
			Description: "Usuario a silenciar",
			Required:    true,
		},
		&discordgo.ApplicationCommandOption{
			Type:        discordgo.ApplicationCommandOptionInteger,
			Name:        "duracion",
			Description: "Duración en minutos",
			Required:    true,
			MinValue:    func() *float64 { v := 1.0; return &v }(),
			MaxValue:    40320, // 28 days max
		},
		&discordgo.ApplicationCommandOption{
			Type:        discordgo.ApplicationCommandOptionString,
			Name:        "razon",
			Description: "Razón del silencio",
			Required:    false,
		},
	).WithUserPermissions(discordgo.PermissionModerateMembers).
		WithBotPermissions(discordgo.PermissionModerateMembers)
}

// muteHandler handles the /mod mute command
func muteHandler(ctx *discord.CommandContext) error {
	user := ctx.GetUserOption("usuario")
	if user == nil {
		return ctx.ReplyEphemeral("❌ Debes especificar un usuario.")
	}

	duration := ctx.GetIntOption("duracion")
	if duration < 1 {
		return ctx.ReplyEphemeral("❌ La duración debe ser al menos 1 minuto.")
	}

	reason := ctx.GetStringOption("razon")
	if reason == "" {
		reason = "Sin razón especificada"
	}

	// Calculate timeout until
	timeoutUntil := time.Now().Add(time.Duration(duration) * time.Minute)

	// Apply timeout (mute)
	err := ctx.Session.GuildMemberTimeout(
		ctx.Interaction.GuildID,
		user.ID,
		&timeoutUntil,
	)
	if err != nil {
		return ctx.ReplyEphemeral(fmt.Sprintf("❌ Error al silenciar: %v", err))
	}

	return ctx.Reply(fmt.Sprintf("🔇 **%s** ha sido silenciado por %d minutos.\n**Razón:** %s",
		user.Username,
		duration,
		reason,
	))
}
