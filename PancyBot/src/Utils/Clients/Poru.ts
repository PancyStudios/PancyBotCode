import { Collection, EmbedBuilder, TextChannel } from 'discord.js'
import { Poru } from 'poru'
import { ExtendedClient } from '../../Structure/Client'
import { errorHandler } from '../../index'
import ms from 'ms'
import { mqttBot } from '../../mqttClient'

export class PoruClient extends Poru {
	paruCache: Collection<string, { channel: string, message: string }> = new Collection()
	progressIntervals: Collection<string, NodeJS.Timeout> = new Collection()

	constructor(client: ExtendedClient) {
		console.debug('Initializing Poru', 'Poru')
		let reconnectIntents = 0
		super(client, [{
			name: "PancyBeta",
			host: process.env.linkserver,
			password: process.env.linkpassword,
			secure: false,
			port: 2333,
		}], {
			defaultPlatform: 'dzsearch',
			send: null,
			autoResume: false,
			library: "discord.js",
		})

		const publishMusicEvent = (guildId: string, event: string, data: any) => {
			mqttBot.publish(`pancy/music/${guildId}/${event}`, {
				...data,
				guildId,
				timestamp: Date.now()
			});
		};

		this.on('nodeConnect', async (_node) => {
			console.info('Conectado con lavalink server', 'Poru')
		})
		this.on('socketClose', async player => {
			console.warn(`Socket closed ${player.guildId}`, 'Poru')
			this.stopProgressInterval(player.guildId);
		})
		this.on('debug', async (e, ew) => {
			if (e === 'PancyBeta') return;
			console.debug(e, 'Poru')
			console.debug(ew, 'Poru')
		})
		this.on('nodeError', async (err) => {
			console.error(`Error al conectar con el servidor local de lavalink: ${err.name}`, 'Poru')
			console.warn('Intentando reconectar...', 'Poru')
			console.error(err, 'Poru')
			errorHandler.report({
				error: 'Lavalink 401',
				message: `Error al conectar con el servidor local de lavalink: ${err.name}`
			})
			console.log(process.platform, 'Poru')
			console.log(err.ws.readyState, 'Poru')
			err.reconnect()
			reconnectIntents++;
			if (reconnectIntents >= 3) {
				console.error(err, 'Poru')
				console.error('No se puede conectar con lavalink...', 'Poru')
			}
		})
		this.on('trackStart', async (player, track) => {
			const guild = client.guilds.cache.get(player.guildId)
			const embed = new EmbedBuilder()
				.setColor('Blurple')
				.setThumbnail(track.info.artworkUrl)
				.setTimestamp()
				.setDescription(`**Titulo:** [${track.info.title}](${track.info.uri}) \n **Duracion** ${ms(track.info.length)}   \n **Estado:** **Reproduciendo**`)
				.setFooter({ text: `Author: ${track.info.author}` });


			const channelText = guild.channels.cache.get(player.textChannel) as TextChannel
			const MESSAGE = await channelText.send({ embeds: [embed] });

			this.paruCache.set(guild.id, { channel: channelText.id, message: MESSAGE.id })

			// MQTT: Publicar evento playing
			publishMusicEvent(player.guildId, 'playing', {
				isPlaying: true,
				isPaused: false,
				currentTrack: {
					title: track.info.title,
					artist: track.info.author,
					duration: track.info.length / 1000, // segundos
					thumbnail: track.info.artworkUrl,
					url: track.info.uri
				},
				progress: 0,
				volume: player.volume,
				queue: player.queue.map(t => ({
					title: t.info.title,
					artist: t.info.author,
					duration: t.info.length / 1000
				}))
			});

			// Iniciar intervalo de progreso
			this.startProgressInterval(player, publishMusicEvent);
		})
		this.on('trackEnd', async (player, track) => {
			this.stopProgressInterval(player.guildId);

			const guild = client.guilds.cache.get(player.guildId)
			const embed3 = new EmbedBuilder()
				.setColor('Blurple')
				.setThumbnail(track.info.artworkUrl)
				.setTimestamp()
				.setDescription(`**Titulo:** [${track.info.title}](${track.info.uri}) \n **Duracion** ${ms(track.info.length)}   \n **Estado:** **Finalizada** `)
				.setFooter({ text: `Author: ${track.info.author}` });

			const cache = this.paruCache.get(guild.id)
			if (cache) {
				try {
					const channel = await guild.channels.fetch(cache.channel) as TextChannel
					const message = await channel.messages.fetch(cache.message)
					await message.edit({ embeds: [embed3] })
				} catch (e) {
					console.error('Error updating message:', e);
				}
			}

			// MQTT: Publicar evento stopped (temporalmente hasta que empiece la siguiente o termine la cola)
			publishMusicEvent(player.guildId, 'stopped', {
				isPlaying: false,
				isPaused: false,
				currentTrack: null,
				progress: 0,
				volume: player.volume,
				queue: []
			});
		})
		this.on('queueEnd', async (player) => {
			this.stopProgressInterval(player.guildId);

			const guild = client.guilds.cache.get(player.guildId);
			await player.destroy();
			await (guild.channels.cache.get(player.textChannel) as TextChannel).send({ content: `Cola finalizada!` });

			// MQTT: Publicar evento queueEnd
			publishMusicEvent(player.guildId, 'stopped', {
				isPlaying: false,
				isPaused: false,
				currentTrack: null,
				progress: 0,
				volume: player.volume,
				queue: []
			});
		})
	}

	startProgressInterval(player: any, publishFunc: Function) {
		this.stopProgressInterval(player.guildId);

		const interval = setInterval(() => {
			if (!player || !player.isPlaying) {
				this.stopProgressInterval(player.guildId);
				return;
			}

			publishFunc(player.guildId, 'progress', {
				isPlaying: true,
				isPaused: player.isPaused,
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
			});
		}, 5000); // Actualizar cada 5 segundos

		this.progressIntervals.set(player.guildId, interval);
	}

	stopProgressInterval(guildId: string) {
		const interval = this.progressIntervals.get(guildId);
		if (interval) {
			clearInterval(interval);
			this.progressIntervals.delete(guildId);
		}
	}
}