import {Command} from "../../../../Structure/CommandSlash";
import {ApplicationCommandOptionType, GuildMember} from "discord.js";

export default new Command({
	name: "volume",
	description: "Ajusta el volumen del bot",
	category: "music",
	options: [
		{
			name: "cantidad",
			description: "Nivel de volumen (0-100)",
			type: ApplicationCommandOptionType.Number,
			required: true,
			min_value: 0,
			max_value: 100
		}
	],

	run: async ({ client, interaction, args }) => {
		const player = client.player.players.get(interaction.guildId);
		const member = interaction.member as GuildMember;
		const vol = args.getNumber("cantidad", true);

		if (!player) return interaction.reply({ content: "❌ No hay música.", flags: ['Ephemeral'] });

		// VALIDACIÓN: Mismo canal
		if (member.voice.channelId !== player.voiceChannel) {
			return interaction.reply({ content: `❌ Debes estar en mi canal de voz (<#${player.voiceChannel}>) para cambiar el volumen.`, flags: ['Ephemeral'] });
		}

		await player.setVolume(vol);
		return interaction.reply(`🔊 Volumen ajustado a **${vol}%**`);
	}
});