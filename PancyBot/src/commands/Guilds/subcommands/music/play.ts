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

			if (!player.isPlaying && !player.isPaused) player.play();

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

			if (!player.isPlaying && !player.isPaused) player.play();

			const embed = new EmbedBuilder()
				.setColor("Blurple")
				.setDescription(`🎶 Playlist cargada: **${res.playlistInfo.name}** (${res.tracks.length} canciones)`)
				.setFooter({ text: `Fuente: ${res.tracks[0].info.sourceName}` });

			return interaction.editReply({ embeds: [embed] });
		}
	}
});