import {Command} from "../../../../Structure/CommandSlash";
import {ApplicationCommandOptionType, EmbedBuilder, GuildMember} from "discord.js";

export default new Command({
	name: "play",
	description: "Reproduce música",
	category: "music",
	inVoiceChannel: true,
	options: [
		{
			name: "cancion",
			description: "Nombre de la canción o URL (Spotify, Apple Music, Deezer, etc.)",
			type: ApplicationCommandOptionType.String,
			required: true
		}
	],
	async auto({ client, interaction }) {
		const focused = interaction.options.getFocused();

		if (!focused || focused.length < 2) {
			return interaction.respond([]);
		}

		if (/^https?:\/\//.test(focused)) {
			return interaction.respond([
				{ name: '🔗 Enlace detectado (Presiona Enter)', value: focused }
			]);
		}

		try {
			const res = await client.player.resolve({
				query: focused,
				source: 'dzsearch',
				requester: interaction.user
			});

			if (!res || res.tracks.length === 0) return interaction.respond([]);

			const tracks = res.tracks.slice(0, 25);

			const suggestions = tracks.map(track => {
				const label = `${track.info.title} - ${track.info.author}`.slice(0, 100);
				return {
					name: label,
					value: track.info.uri
				};
			});

			await interaction.respond(suggestions);

		} catch (e) {
			return interaction.respond([]);
		}
	},
	run: async ({ client, interaction, args }) => {
		const member = interaction.member as GuildMember;
		const voiceChannel = member.voice.channel;
		const query = args.getString("cancion", true);

		if (!voiceChannel) {
			return interaction.reply({ content: "❌ Debes estar en un canal de voz.", flags: ['Ephemeral'] });
		}

		if (!voiceChannel.joinable) {
			return interaction.reply({ content: "❌ No tengo permisos para unirme o hablar en ese canal.", flags: ['Ephemeral'] });
		}

		const playerExist = client.player.players.get(interaction.guildId);

		if ((playerExist && member.voice.channelId !== playerExist.voiceChannel) || !member.permissions.has('ManageGuild')) {
			return interaction.reply({
				content: `❌ Ya estoy reproduciendo música en <#${playerExist.voiceChannel}>. Debes unirte a ese canal para pedir canciones o tener el permiso de ManageGuild para tener prioridad.`,
				flags: ['Ephemeral'],
			});
		}

		await interaction.deferReply();

		// --- LÓGICA INTELIGENTE DE FUENTE ---
		// Detectamos si el usuario puso un link (http/https)
		const isUrl = /^https?:\/\//.test(query);

		// Si es URL: source = null (Lavalink detecta automáticamente el servicio: Spotify, Apple, etc.)
		// Si es Texto: source = "dzsearch" (Busca en Deezer por defecto)
		const source = isUrl ? null : "dzsearch";

		const player = client.player.createConnection({
			guildId: interaction.guildId,
			voiceChannel: voiceChannel.id,
			textChannel: interaction.channelId,
			deaf: true,
		});

		// Resolvemos la canción con la fuente calculada
		const res = await client.player.resolve({ query, source, requester: member.user });

		if (res.loadType === 'error') {
			return interaction.editReply("❌ Error al cargar la canción. Intenta de nuevo.");
		}

		if (res.loadType === 'empty') {
			return interaction.editReply("❌ No se encontraron resultados.");
		}

		// 1. Canción individual o resultado de búsqueda
		if (res.loadType === 'track' || res.loadType === 'search') {
			const track = res.tracks[0];
			player.queue.add(track);

			if (!player.isPlaying && !player.isPaused) await player.play();

			const embed = new EmbedBuilder()
				.setColor("Blurple")
				.setDescription(`🎶 Añadido a la cola: **[${track.info.title}](${track.info.uri})**`)
				// Mostramos la fuente real de donde viene el audio (ej: Deezer)
				.setFooter({ text: `Fuente: ${track.info.sourceName}` });

			return interaction.editReply({ embeds: [embed] });
		}

		// 2. Playlist (Spotify, Apple Music, Deezer, etc.)
		if (res.loadType === 'playlist') {
			for (const track of res.tracks) {
				track.info.requester = member.user;
				player.queue.add(track);
			}

			if (!player.isPlaying && !player.isPaused) await player.play();

			const embed = new EmbedBuilder()
				.setColor("Blurple")
				.setDescription(`🎶 Playlist **${res.playlistInfo.name}** cargada.`)
				.addFields(
					{ name: "Canciones", value: `${res.tracks.length}`, inline: true },
					{ name: "Duración Total", value: formatTime(res.tracks.reduce((acc, cur) => acc + cur.info.length, 0)), inline: true }
				)
				.setFooter({ text: `Fuente: ${res.tracks[0].info.sourceName} | Pedido por ${member.user.tag}`, iconURL: member.user.displayAvatarURL() });

			return interaction.editReply({ embeds: [embed] });
		}
	}
});

function formatTime(ms: number): string {
	const seconds = Math.floor((ms / 1000) % 60);
	const minutes = Math.floor((ms / (1000 * 60)) % 60);
	const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
	const hoursStr = (hours < 10) ? "0" + hours : hours;
	const minutesStr = (minutes < 10) ? "0" + minutes : minutes;
	const secondsStr = (seconds < 10) ? "0" + seconds : seconds;
	if (hours > 0) return `${hoursStr}:${minutesStr}:${secondsStr}`;
	return `${minutesStr}:${secondsStr}`;
}