import {ButtonInteraction, ButtonStyle, EmbedBuilder, GuildMember, TextChannel} from 'discord.js'
import {Poru} from 'poru'
import {ExtendedClient} from '../../Structure/Client'
import {errorHandler} from '../../index'
import ms from 'ms'

export class PoruClient extends Poru {
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
        //process.abort()
            }
        })
        this.on('trackStart', async (player, track) => {
	        const guild = client.guilds.cache.get(player.guildId)

	        const embed = new EmbedBuilder()
		        .setColor('Blurple')
		        .setTitle('Started Playing')
		        .setThumbnail(track.info.artworkUrl)
		        .setTimestamp()
		        .setDescription(`**Title:** [${track.info.title}](${track.info.uri}) \n **Song Duration** ${ms(track.info.length)}   \n **Estado:** **Reproduciendo** \n *Join my VC to use buttons*`)
		        .setFooter({text: `Author: ${track.info.author}`});

	        const embed3 = new EmbedBuilder()
		        .setColor('Blurple')
		        .setTitle('La cancion a finalizado')
		        .setThumbnail(track.info.artworkUrl)
		        .setTimestamp()
		        .setDescription(`**Titulo:** [${track.info.title}](${track.info.uri}) \n **Duracion** ${ms(track.info.length)}   \n **Estado:** **Finalizada** `)
		        .setFooter({text: `Author: ${track.info.author}`});

	        const channelText = guild.channels.cache.get(player.textChannel) as TextChannel
	        const MESSAGE = await channelText.send({embeds: [embed]} );


	        const ttt = track.info.length

	        const filter = i => (i as ButtonInteraction).guild.members.cache.get(client.user.id).voice.channel == ((i as ButtonInteraction).member as GuildMember).voice.channel

	        const collector = MESSAGE.channel.createMessageComponentCollector({filter, time: ttt });
	        collector.on('collect', async _i => {
		        collector.on('end', async (_i) => {
			        await MESSAGE.edit({embeds: [embed3]});
		        })
	        })
	        this.on('queueEnd', (player) => {
		        const guild = client.guilds.cache.get(player.guildId);
		        (guild.channels.cache.get(player.textChannel) as TextChannel).send({content: `Queue has ended!`});
		        player.destroy();
	        })
        })
    }
}