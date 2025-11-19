import {Command} from "../../../../Structure/CommandSlash";

export default new Command({
	name: "stop",
	description: "Detiene la música y desconecta al bot",
	category: "music",

	run: async ({ client, interaction }) => {
		const member = interaction.member;
		const player = client.player.players.get(interaction.guildId);

		if (member.voice.channelId !== player.voiceChannel) {
			return interaction.reply({ content: `❌ Debes estar en mi canal de voz (<#${player.voiceChannel}>) para saltar la canción.`, flags: ['Ephemeral'] });
		}
		if (!player) return interaction.reply({ content: "❌ No estoy reproduciendo música.", flags: ['Ephemeral'] });

		await player.destroy();
		return interaction.reply("⏹ **Desconectado y cola limpiada.**");
	}
});