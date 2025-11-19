import {Command} from "../../../../Structure/CommandSlash";

export default new Command({
	name: "skip",
	description: "Salta la canción actual",
	category: "music",

	run: async ({ client, interaction }) => {
		const member = interaction.member;
		const player = client.player.players.get(interaction.guildId);

		if (member.voice.channelId !== player.voiceChannel) {
			return interaction.reply({ content: `❌ Debes estar en mi canal de voz (<#${player.voiceChannel}>) para saltar la canción.`, flags: ['Ephemeral'] });
		}
		if (!player) return interaction.reply({ content: "❌ No estoy reproduciendo música.", flags: ['Ephemeral'] });
		if (!player.currentTrack) return interaction.reply({ content: "❌ No hay nada sonando para saltar.", flags: ['Ephemeral'] });

		await player.skip(); // Al detener la actual, Poru automáticamente reproduce la siguiente
		return interaction.reply("⏭ **Canción saltada.**");
	}
});