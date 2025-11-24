import {Command} from "../../../../Structure/CommandSlash";
import {EmbedBuilder, TextChannel} from "discord.js";
import ms from "ms";

export default new Command({
	name: "skip",
	description: "Salta la canción actual",
	category: "music",

	run: async ({ client, interaction }) => {
		const player = client.player.players.get(interaction.guildId);
		const { channel, message } = client.player.paruCache.get(player.guildId);
		const member = interaction.member;

		if (member.voice.channelId !== player.voiceChannel) {
			return interaction.reply({ content: `❌ Debes estar en mi canal de voz (<#${player.voiceChannel}>) para saltar la canción.`, flags: ['Ephemeral'] });
		}
		if (!player) return interaction.reply({ content: "❌ No estoy reproduciendo música.", flags: ['Ephemeral'] });
		if (!player.currentTrack) return interaction.reply({ content: "❌ No hay nada sonando para saltar.", flags: ['Ephemeral'] });

		const track = player.currentTrack;

		const embed = new EmbedBuilder()
			.setColor('Blurple')
			.setThumbnail(track.info.artworkUrl)
			.setTimestamp()
			.setDescription(`**Titulo:** [${track.info.title}](${track.info.uri}) \n **Duracion** ${ms(track.info.length)}   \n **Estado:** **Skipeado por <@${interaction.member.id}>** `)
			.setFooter({text: `Author: ${track.info.author}`});

		const channelFetch = await interaction.guild.channels.fetch(channel) as TextChannel;
		const messageFetch = await channelFetch.messages.fetch(message);

		await player.skip();
		await interaction.reply("⏭ **Canción saltada.**");

		messageFetch.edit({ embeds: [embed] });
	}
});