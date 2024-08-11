import { EmbedBuilder, ButtonStyle, ButtonBuilder, ActionRowBuilder, TextChannel, ButtonInteraction, GuildMember} from 'discord.js'
import { Poru } from 'poru'
import { ExtendedClient } from '../../Structure/Client'
import { errorHandler } from '../..'
import ms from 'ms'

export class PoruClient extends Poru {
    constructor(client: ExtendedClient) {
        let reconnectIntents = 0
        super(client, [{         
            name: "PancyBeta",
            host: process.env.linkserver,
            password: process.env.linkpassword,
            port: 3625,
            secure: false
        }], {
            defaultPlatform: 'spsearch',
            send: null,
            autoResume: false,
            library: "discord.js",
        })
        this.on('nodeConnect', async (node) => {
            console.info('Conectado con lavalink server', 'Poru')
        })
        this.on('socketClose', async player => {
            console.warn(`Socket closed ${player.guildId}`, 'Poru')
        })
        this.on('nodeError', async (err) => { 
            console.error(`Error al conectar con el servidor local de lavalink: ${err.name}`, 'Poru')
            console.warn('Intentando reconectar...', 'Poru')
            
            console.error(err, 'Poru')
            await errorHandler.report({
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
            const button1 = new ButtonBuilder()
            .setLabel('Pause')
            .setCustomId('pause')
            .setStyle(ButtonStyle.Primary)
        
            const button2 = new ButtonBuilder()
            .setLabel('Resume')
            .setCustomId('resume')
            .setStyle(ButtonStyle.Success)
        
            const button3 = new ButtonBuilder()
            .setLabel('Skip')
            .setCustomId('skip')
            .setStyle(ButtonStyle.Success)
        
            const button4 = new ButtonBuilder()
            .setLabel('Pause')
            .setCustomId('dpause')
            .setDisabled(true)
            .setStyle(ButtonStyle.Secondary)
        
            const button5 = new ButtonBuilder()
            .setLabel('Resume')
            .setCustomId('dresume')
            .setDisabled(true)
            .setStyle(ButtonStyle.Secondary)
        
            const button6 = new ButtonBuilder()
                .setLabel('Skip')
                .setCustomId('dskip')
                .setDisabled(true)
                .setStyle(ButtonStyle.Secondary)
        
            const button7 = new ButtonBuilder()
                .setLabel('Stop')
                .setCustomId('stop')
                .setStyle(ButtonStyle.Danger)
        
            const button8 = new ButtonBuilder()
                .setLabel('Stop')
                .setCustomId('dstop')
                .setDisabled(true)
                .setStyle(ButtonStyle.Secondary)
        
            const row1 = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(button4, button5, button6, button8)
            const row2 = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(button1, button3, button7)
            const row3 = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(button2, button3)
        
            const embed = new EmbedBuilder()
                .setColor('Blurple')
                .setTitle('Started Playing')
                .setThumbnail(track.info.artworkUrl)
                .setTimestamp()
                .setDescription(`**Title:** [${track.info.title}](${track.info.uri}) \n\n **Song Duration** ${ms(track.info.length)}   \n\n **Status:** **Playing** \n\n *Join my VC to use buttons*`)
                .setFooter({ text: `Author: ${track.info.author}`});
        
            const embed3 = new EmbedBuilder()
                .setColor('Blurple')
                .setTitle('Song was Ended')
                .setThumbnail(track.info.artworkUrl)
                .setTimestamp()
                .setDescription(`**Title:** [${track.info.title}](${track.info.uri}) \n\n **Song Duration** ${ms(track.info.length)}   \n\n **Status:** **Finished** `)
                .setFooter({ text: `Author: ${track.info.author}`});
                
            const channelText = guild.channels.cache.get(player.textChannel) as TextChannel
            const MESSAGE = await channelText.send({ embeds: [embed], components: [row2]});
        
            const ttt = track.info.length
        
            const filter = i  => (i as ButtonInteraction).guild.members.cache.get(client.user.id).voice.channel == ((i as ButtonInteraction).member as GuildMember).voice.channel
        
            const collector = MESSAGE.channel.createMessageComponentCollector({ filter, time: ttt });
            collector.on('collect', async i => {
            const embed4 = new EmbedBuilder()
                .setColor('Blurple')
                .setTitle('Started Playing')
                .setThumbnail(track.info.artworkUrl)
                .setTimestamp()
                .setDescription(`**Title:** [${track.info.title}](${track.info.uri}) \n\n **Song Duration** ${ms(track.info.length)}   \n\n **Status:** Resumed by <@${i.user.id}> \n\n *People in channel can use button* `)
                .setFooter({ text: `Author: ${track.info.author}`});
        
                const embed2 = new EmbedBuilder()
                .setColor('Blurple')
                .setTitle('Music Paused')
                .setThumbnail(track.info.artworkUrl)
                .setTimestamp()
                .setDescription(`**Title:** [${track.info.title}](${track.info.uri}) \n\n **Song Duration:** ${ms(track.info.length)}   \n\n **Status:** Paused by <@${i.user.id}> \n\n *People in channel can use button* `)
                .setFooter({ text: `Author: ${track.info.author}`});
        
                const embed5 = new EmbedBuilder()
                .setColor('Blurple')
                .setTitle('Started Playing')
                .setThumbnail(track.info.artworkUrl)
                .setTimestamp()
                .setDescription(`**Title:** [${track.info.title}](${track.info.uri}) \n\n **Song Duration** ${ms(track.info.length)}   \n\n **Status:** Skiped by <@${i.user.id}> `)
                .setFooter({ text: `Author: ${track.info.author}`});
        
                                
            if (i.customId === 'pause') {
                    // if (i.guild.me.voice.channel !== i.member.voice.channel) {
                    //  await i.reply({ content: 'You have to join my VC!', ephemeral: true});
                    // }
                
            await i.deferUpdate();
            if(player.isPaused){
                await i.reply({ content: 'Music is Already Paused', ephemeral: true});
            }  
            
            if (!player.isPaused)  {
                
                player.pause(true)
                await i.editReply({ embeds: [embed2], components: [row3]});
            }
            }   if (i.customId === 'resume') {
                await i.deferUpdate();
                player.pause(false)
                await i.editReply({ embeds: [embed4], components: [row2]});
            }
        
                    if (i.customId === 'skip') {
                    await i.deferUpdate();   
                    player.skip();
                        await i.editReply({ embeds: [embed5], components: [row1]});
            }
                    if (i.customId === 'stop') {
                    await i.deferUpdate();
                    player.destroy()
                    await i.editReply({ embeds: [embed5], components: [row1]});
            }
            });
        
            collector.on('end', async (i) => {
                await MESSAGE.edit({ embeds: [embed3], components: [row1]});
            })
        })
        this.on('trackEnd', (player, _track, _lavalink) => {
            const guild = client.guilds.cache.get(player.guildId);
            (guild.channels.cache.get(player.textChannel) as TextChannel).send({content:`Queue has ended!`});
            player.destroy();
        })        
    }
}