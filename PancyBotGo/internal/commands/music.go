// Package commands provides music commands for the bot.
package commands

import (
	"fmt"
	"strings"

	"github.com/PancyStudios/PancyBotCode/PancyBotGo/pkg/discord"
	"github.com/PancyStudios/PancyBotCode/PancyBotGo/pkg/lavalink"
	"github.com/bwmarrin/discordgo"
)

// minVolumeFloat is the minimum volume value for Discord command options
var minVolumeFloat = 0.0

// RegisterMusicCommands registers all music commands
func RegisterMusicCommands(client *discord.ExtendedClient) {
	// Play command
	playCmd := discord.NewCommand(
		"play",
		"Reproduce una canción o la añade a la cola",
		"music",
		playHandler,
	).WithOptions(
		&discordgo.ApplicationCommandOption{
			Type:        discordgo.ApplicationCommandOptionString,
			Name:        "query",
			Description: "Nombre de la canción o URL",
			Required:    true,
		},
	).RequiresVoice()
	client.CommandHandler.RegisterCommand(playCmd)
	client.CommandHandler.AddGlobalCommand(playCmd.ToApplicationCommand())

	// Pause command
	pauseCmd := discord.NewCommand(
		"pause",
		"Pausa o resume la reproducción",
		"music",
		pauseHandler,
	).RequiresVoice()
	client.CommandHandler.RegisterCommand(pauseCmd)
	client.CommandHandler.AddGlobalCommand(pauseCmd.ToApplicationCommand())

	// Skip command
	skipCmd := discord.NewCommand(
		"skip",
		"Salta a la siguiente canción",
		"music",
		skipHandler,
	).RequiresVoice()
	client.CommandHandler.RegisterCommand(skipCmd)
	client.CommandHandler.AddGlobalCommand(skipCmd.ToApplicationCommand())

	// Stop command
	stopCmd := discord.NewCommand(
		"stop",
		"Detiene la reproducción y limpia la cola",
		"music",
		stopHandler,
	).RequiresVoice()
	client.CommandHandler.RegisterCommand(stopCmd)
	client.CommandHandler.AddGlobalCommand(stopCmd.ToApplicationCommand())

	// Queue command
	queueCmd := discord.NewCommand(
		"queue",
		"Muestra la cola de reproducción",
		"music",
		queueHandler,
	)
	client.CommandHandler.RegisterCommand(queueCmd)
	client.CommandHandler.AddGlobalCommand(queueCmd.ToApplicationCommand())

	// Volume command
	volumeCmd := discord.NewCommand(
		"volume",
		"Ajusta el volumen de reproducción",
		"music",
		volumeHandler,
	).WithOptions(
		&discordgo.ApplicationCommandOption{
			Type:        discordgo.ApplicationCommandOptionInteger,
			Name:        "level",
			Description: "Nivel de volumen (0-100)",
			Required:    true,
			MinValue:    &minVolumeFloat,
			MaxValue:    100,
		},
	).RequiresVoice()
	client.CommandHandler.RegisterCommand(volumeCmd)
	client.CommandHandler.AddGlobalCommand(volumeCmd.ToApplicationCommand())

	// NowPlaying command
	npCmd := discord.NewCommand(
		"nowplaying",
		"Muestra la canción que se está reproduciendo",
		"music",
		nowPlayingHandler,
	)
	client.CommandHandler.RegisterCommand(npCmd)
	client.CommandHandler.AddGlobalCommand(npCmd.ToApplicationCommand())
}

// playHandler handles the /play command
func playHandler(ctx *discord.CommandContext) error {
	query := ctx.GetStringOption("query")
	if query == "" {
		return ctx.ReplyEphemeral("❌ Debes proporcionar una canción para reproducir.")
	}

	// Get user's voice channel
	voiceState, err := ctx.Session.State.VoiceState(ctx.Interaction.GuildID, ctx.User().ID)
	if err != nil || voiceState.ChannelID == "" {
		return ctx.ReplyEphemeral("❌ Debes estar en un canal de voz.")
	}

	// Defer the response since search might take time
	ctx.Defer()

	// Search for the track
	lavalinkClient := lavalink.Get()
	if lavalinkClient == nil {
		return ctx.EditReply("❌ El sistema de música no está disponible.")
	}

	result, err := lavalinkClient.Search(query)
	if err != nil {
		return ctx.EditReply(fmt.Sprintf("❌ Error buscando: %v", err))
	}

	if result.LoadType == "empty" || len(result.Tracks) == 0 {
		return ctx.EditReply("❌ No se encontraron resultados.")
	}

	if result.LoadType == "error" && result.Exception != nil {
		return ctx.EditReply(fmt.Sprintf("❌ Error: %s", result.Exception.Message))
	}

	track := result.Tracks[0]

	// Play the track
	if err := lavalinkClient.Play(ctx.Interaction.GuildID, voiceState.ChannelID, ctx.Interaction.ChannelID, track); err != nil {
		return ctx.EditReply(fmt.Sprintf("❌ Error reproduciendo: %v", err))
	}

	// Create embed response
	embed := &discordgo.MessageEmbed{
		Color:       0x5865F2, // Blurple
		Title:       "🎵 Añadido a la cola",
		Description: fmt.Sprintf("[%s](%s)", track.Info.Title, track.Info.URI),
		Thumbnail: &discordgo.MessageEmbedThumbnail{
			URL: track.Info.ArtworkURL,
		},
		Fields: []*discordgo.MessageEmbedField{
			{
				Name:   "Artista",
				Value:  track.Info.Author,
				Inline: true,
			},
			{
				Name:   "Duración",
				Value:  formatDuration(track.Info.Length),
				Inline: true,
			},
		},
	}

	return ctx.EditReplyEmbed(embed)
}

// pauseHandler handles the /pause command
func pauseHandler(ctx *discord.CommandContext) error {
	lavalinkClient := lavalink.Get()
	if lavalinkClient == nil {
		return ctx.ReplyEphemeral("❌ El sistema de música no está disponible.")
	}

	player := lavalinkClient.GetPlayer(ctx.Interaction.GuildID)
	player.Mu.RLock()
	isPaused := player.IsPaused
	player.Mu.RUnlock()

	if err := lavalinkClient.Pause(ctx.Interaction.GuildID, !isPaused); err != nil {
		return ctx.ReplyEphemeral(fmt.Sprintf("❌ Error: %v", err))
	}

	if isPaused {
		return ctx.Reply("▶️ Reproducción resumida.")
	}
	return ctx.Reply("⏸️ Reproducción pausada.")
}

// skipHandler handles the /skip command
func skipHandler(ctx *discord.CommandContext) error {
	lavalinkClient := lavalink.Get()
	if lavalinkClient == nil {
		return ctx.ReplyEphemeral("❌ El sistema de música no está disponible.")
	}

	if err := lavalinkClient.Skip(ctx.Interaction.GuildID); err != nil {
		return ctx.ReplyEphemeral(fmt.Sprintf("❌ Error: %v", err))
	}

	return ctx.Reply("⏭️ Canción saltada.")
}

// stopHandler handles the /stop command
func stopHandler(ctx *discord.CommandContext) error {
	lavalinkClient := lavalink.Get()
	if lavalinkClient == nil {
		return ctx.ReplyEphemeral("❌ El sistema de música no está disponible.")
	}

	if err := lavalinkClient.Stop(ctx.Interaction.GuildID); err != nil {
		return ctx.ReplyEphemeral(fmt.Sprintf("❌ Error: %v", err))
	}

	lavalinkClient.DestroyPlayer(ctx.Interaction.GuildID)

	return ctx.Reply("⏹️ Reproducción detenida y cola limpiada.")
}

// queueHandler handles the /queue command
func queueHandler(ctx *discord.CommandContext) error {
	lavalinkClient := lavalink.Get()
	if lavalinkClient == nil {
		return ctx.ReplyEphemeral("❌ El sistema de música no está disponible.")
	}

	player := lavalinkClient.GetPlayer(ctx.Interaction.GuildID)
	player.Mu.RLock()
	defer player.Mu.RUnlock()

	if player.CurrentTrack == nil && len(player.Queue) == 0 {
		return ctx.Reply("📭 La cola está vacía.")
	}

	var sb strings.Builder
	sb.WriteString("📋 **Cola de reproducción**\n\n")

	if player.CurrentTrack != nil {
		sb.WriteString(fmt.Sprintf("🎵 **Reproduciendo:** [%s](%s) - %s\n\n",
			player.CurrentTrack.Info.Title,
			player.CurrentTrack.Info.URI,
			formatDuration(player.CurrentTrack.Info.Length)))
	}

	if len(player.Queue) > 0 {
		sb.WriteString("**Siguiente:**\n")
		for i, track := range player.Queue {
			if i >= 10 {
				sb.WriteString(fmt.Sprintf("\n... y %d más", len(player.Queue)-10))
				break
			}
			sb.WriteString(fmt.Sprintf("%d. %s - %s\n",
				i+1, track.Info.Title, formatDuration(track.Info.Length)))
		}
	}

	return ctx.Reply(sb.String())
}

// volumeHandler handles the /volume command
func volumeHandler(ctx *discord.CommandContext) error {
	level := int(ctx.GetIntOption("level"))

	lavalinkClient := lavalink.Get()
	if lavalinkClient == nil {
		return ctx.ReplyEphemeral("❌ El sistema de música no está disponible.")
	}

	if err := lavalinkClient.SetVolume(ctx.Interaction.GuildID, level); err != nil {
		return ctx.ReplyEphemeral(fmt.Sprintf("❌ Error: %v", err))
	}

	return ctx.Reply(fmt.Sprintf("🔊 Volumen ajustado a %d%%", level))
}

// nowPlayingHandler handles the /nowplaying command
func nowPlayingHandler(ctx *discord.CommandContext) error {
	lavalinkClient := lavalink.Get()
	if lavalinkClient == nil {
		return ctx.ReplyEphemeral("❌ El sistema de música no está disponible.")
	}

	player := lavalinkClient.GetPlayer(ctx.Interaction.GuildID)
	player.Mu.RLock()
	defer player.Mu.RUnlock()

	if player.CurrentTrack == nil {
		return ctx.Reply("🔇 No hay nada reproduciéndose.")
	}

	track := player.CurrentTrack
	progress := float64(player.Position) / float64(track.Info.Length) * 100

	embed := &discordgo.MessageEmbed{
		Color:       0x5865F2,
		Title:       "🎵 Reproduciendo ahora",
		Description: fmt.Sprintf("[%s](%s)", track.Info.Title, track.Info.URI),
		Thumbnail: &discordgo.MessageEmbedThumbnail{
			URL: track.Info.ArtworkURL,
		},
		Fields: []*discordgo.MessageEmbedField{
			{
				Name:   "Artista",
				Value:  track.Info.Author,
				Inline: true,
			},
			{
				Name:   "Progreso",
				Value:  fmt.Sprintf("%s / %s (%.1f%%)", formatDuration(player.Position), formatDuration(track.Info.Length), progress),
				Inline: true,
			},
			{
				Name:   "Volumen",
				Value:  fmt.Sprintf("%d%%", player.Volume),
				Inline: true,
			},
		},
	}

	return ctx.ReplyEmbed(embed)
}

// formatDuration formats milliseconds to mm:ss format
func formatDuration(ms int64) string {
	seconds := ms / 1000
	minutes := seconds / 60
	seconds = seconds % 60
	return fmt.Sprintf("%d:%02d", minutes, seconds)
}
