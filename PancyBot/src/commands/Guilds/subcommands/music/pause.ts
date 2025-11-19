import {Command} from "../../../../Structure/CommandSlash";

export default new Command({
	name: "pause",
	description: "Pausa la reproducción",
	category: "music",

	run: async ({ client, interaction }) => {
		const player = client.player.players.get(interaction.guildId);
		const member = interaction.member;
		if (!player) return interaction.reply({ content: "❌ No hay música.", flags: ['Ephemeral'] });
		if (member.voice.channelId !== player.voiceChannel) {
			return interaction.reply({ content: `❌ Debes estar en mi canal de voz (<#${player.voiceChannel}>) para saltar la canción.`, flags: ['Ephemeral'] });
		}
		if (player.isPaused) return interaction.reply({ content: "⚠️ Ya está pausado.", flags: ['Ephemeral'] });

		await player.pause(true);
		return interaction.reply("⏸ **Música pausada.**");
	}
});