import {Collection, EmbedBuilder, TextChannel} from 'discord.js'
import {Poru} from 'poru'
import {ExtendedClient} from '../../Structure/Client'
import {errorHandler} from '../../index'
import ms from 'ms'

export class PoruClient extends Poru {
	paruCache : Collection<string, { channel: string, message: string }> = new Collection()

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
	    this.on('nodeConnect', async (_node) => {
				console.info('Conectado con lavalink server', 'Poru')
			})
	    this.on('socketClose', async player => {
				console.warn(`Socket closed ${player.guildId}`, 'Poru')
			})
	    this.on('debug', async (e, ew) => {
				if(e === 'PancyBeta') return;
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
			    .setFooter({text: `Author: ${track.info.author}`});


				const channelText = guild.channels.cache.get(player.textChannel) as TextChannel
		    const MESSAGE = await channelText.send({embeds: [embed]} );

				this.paruCache.set(guild.id, { channel : channelText.id, message: MESSAGE.id})
			})
	    this.on('trackEnd', async (player, track) => {
				const guild = client.guilds.cache.get(player.guildId)
		    const embed3 = new EmbedBuilder()
			    .setColor('Blurple')
			    .setThumbnail(track.info.artworkUrl)
			    .setTimestamp()
			    .setDescription(`**Titulo:** [${track.info.title}](${track.info.uri}) \n **Duracion** ${ms(track.info.length)}   \n **Estado:** **Finalizada** `)
			    .setFooter({text: `Author: ${track.info.author}`});

				const cache = this.paruCache.get(guild.id)
				const channel = await guild.channels.fetch(cache.channel) as TextChannel
		    const message = await channel.messages.fetch(cache.message)
				await message.edit({ embeds: [embed3] })
	    })
	    this.on('queueEnd', async (player) => {
		    const guild = client.guilds.cache.get(player.guildId);
		    await player.destroy();
		    await (guild.channels.cache.get(player.textChannel) as TextChannel).send({content: `Cola finalizada!`});
	    })
    }
}