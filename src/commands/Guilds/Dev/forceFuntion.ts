import { Command } from "../../../Structure/CommandSlash";
import { version } from '../../../../package.json'
import { EmbedBuilder, Colors, ApplicationCommandOptionType, Message } from "discord.js";
import { Server } from '../../..';
import { exec } from 'child_process';

export default new Command({
    name: 'force',
    description: 'Fuerza el uso de una funcion',
    category: 'dev',
    options: [{
        name: 'funcion',
        description: 'Que funcion quieres forzar?',
        required: true,
        type: ApplicationCommandOptionType.String,
        choices: [{
            name: 'Apagar sistema',
            value: 'killSystem'   
        }, {
            name: 'Apagar servidor web',
            value: 'killWebServer'
        }, {
            name: 'Actualizar',
            value: 'update'
        }]
    }],
    isDev: true,

    async run({ interaction, args, client }) {
        const owo = args.getString('funcion')

        if(owo === "killSystem") {
            const Embed = new EmbedBuilder()
            .setDescription('Estas seguro que quieres forzar esta funcion?, en caso de estar seguro escribe `confirm`')
            .setColor(Colors.Yellow)
            .setFooter({ text: `PancyBot v${version} | Dev Funtions`, iconURL: client.user.avatarURL() })
            
            const msg_filter = (m) => m.author.id === interaction.user.id && m.channelId === interaction.channelId;
            const collector = interaction.channel.awaitMessages({ time: 15000, filter: msg_filter, max: 1 })

            interaction.reply({ embeds: [Embed] }).then(async msg => {
                collector.then(async x => {
                    const actionConfirm = x.first().content 
                    if(!actionConfirm) {
                        Embed.setDescription('Accion cancelada')
                        interaction.editReply({ embeds: [Embed] })
                                                return
                        
                    }
                    if(actionConfirm !== 'confirm') {
                        Embed.setDescription('Accion cancelada')
                        interaction.editReply({ embeds: [Embed] })
                                                return
                    }

                    const EmbedConfirm = new EmbedBuilder()
                    .setDescription("Apagando sistema...\n\n\n||Es probable que tengas que volver a ejecutar este comando mas de 2 veces||")
                    interaction.editReply({ embeds: [Embed] })

                    await (msg as unknown as Message).react('✅')
                    client.destroy()
                    process.exit(1)
                })
            })

        } else if(owo === "killWebServer") {
            const Embed = new EmbedBuilder()
            .setDescription('Estas seguro que quieres forzar esta funcion?, esto dejara al bot sin acceso a la api de Top.gg usada para votar\n\n en caso de estar seguro escribe `confirm`')
            .setColor(Colors.Yellow)
            .setFooter({ text: `PancyBot v${version} | Dev Funtions`, iconURL: client.user.avatarURL() })
            
            const msg_filter = (m) => m.author.id === interaction.user.id && m.channelId === interaction.channelId;
            const collector = interaction.channel.awaitMessages({ time: 15000, filter: msg_filter, max: 1 })

            interaction.reply({ embeds: [Embed] }).then(async msg => {
                collector.then(async x => {
                    const actionConfirm = x.first().content 
                    if(!actionConfirm) {
                        Embed.setDescription('Accion cancelada')
                        interaction.editReply({ embeds: [Embed] })
                                                return
                        
                    }
                    if(actionConfirm !== 'confirm') {
                        Embed.setDescription('Accion cancelada')
                        interaction.editReply({ embeds: [Embed] })
                                                return
                    }

                    const EmbedConfirm = new EmbedBuilder()
                    .setDescription("Apagando la pagina local...")
                    .setColor('Red')
                    .setTimestamp()
                    msg.edit({ embeds: [EmbedConfirm], })

                    Server.close()
                    await (msg as unknown as Message).react('✅')
                })
            })
        } else if(owo === "update") {
            exec('git pull', async (err, stdout, stderr) => {
                if (err) {
                    console.error(err as unknown as string)
                    return
                }
                if (stderr) {
                    console.error(stderr)
                    return
                }
                console.info(stdout);
                interaction.reply({ content: 'Actualizado correctamente' + stdout })
            })
        }
        else {
            interaction.reply('No existe la funcion')
        }
    }
})