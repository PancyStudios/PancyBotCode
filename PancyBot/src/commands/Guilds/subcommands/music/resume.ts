import {Command} from "../../../../Structure/CommandSlash";

export default new Command({
	name: "resume",
	description: "Reanuda la reproducción",
	category: "music",

	run: async ({ client, interaction }) => {
		const player = client.player.players.get(interaction.guildId);
		const member = interaction.member;
		if (!player) return interaction.reply({ content: "❌ No hay música.", flags: ['Ephemeral'] });

		if (member.voice.channelId !== player.voiceChannel) {
			return interaction.reply({ content: `❌ Debes estar en mi canal de voz (<#${player.voiceChannel}>) para saltar la canción.`, flags: ['Ephemeral'] });
		}
		if (!player.isPaused) return interaction.reply({ content: "⚠️ La música no está pausada.", flags: ['Ephemeral'] });

		await player.pause(false);
		client.player.stopProgressInterval(interaction.guildId);
		client.player.startProgressInterval(player, client.player.publishMusicEvent);
		client.player.publishMusicEvent(interaction.guildId, 'resume', {
			isPlaying: true,
			isPaused: false,
			currentTrack: player.currentTrack ? {
				title: player.currentTrack.info.title,
				artist: player.currentTrack.info.author,
				duration: player.currentTrack.info.length / 1000,
				thumbnail: player.currentTrack.info.artworkUrl,
				url: player.currentTrack.info.uri
			} : null,
			progress: player.position / 1000, // segundos
			volume: player.volume,
			queue: player.queue.map((t: any) => ({
				title: t.info.title,
				artist: t.info.author,
				duration: t.info.length / 1000
			}))
		})
		return interaction.reply("▶️ **Música reanudada.**");
	}
});