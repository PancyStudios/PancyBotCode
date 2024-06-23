import { Command } from "../../../Structure/CommandMsg";
import { version } from '../../../../package.json'
import { EmbedBuilder, Colors, WebhookClient } from "discord.js";
import { logs, Server } from '../../..';
import { exec } from 'child_process';

const Webhook = new WebhookClient({ url: 'https://discord.com/api/webhooks/990077896498483260/tATJeJMEF03sfW0G3YwUCCrmGd7znIimQuFpwG-5tMs8DGQsMwoTFPMdL60bt8cf0_vJ'})

export default new Command({
    name: 'force',
    description: 'Fuerza el uso de una funcion',
    use: '<function>',
    category: 'dev',
    isDev: true,

    async run({ message, args, client }) {
        if(args[0] === "killSystem") {
            const Embed = new EmbedBuilder()
            .setDescription('Estas seguro que quieres forzar esta funcion?, en caso de estar seguro escribe `confirm`')
            .setColor(Colors.Yellow)
            .setFooter({ text: `PancyBot v${version} | Dev Funtions`, iconURL: client.user.avatarURL() })
            
            const msg_filter = (m) => m.author.id === message.author.id && m.channelId === message.channelId;
            const collector = message.channel.awaitMessages({ time: 15000, filter: msg_filter, max: 1 })

            message.reply({ embeds: [Embed] }).then(async msg => {
                collector.then(async x => {
                    const actionConfirm = x.first().content 
                    if(!actionConfirm) {
                        Embed.setDescription('Accion cancelada')
                        msg.edit({ embeds: [Embed] })
                                                return
                        
                    }
                    if(actionConfirm !== 'confirm') {
                        Embed.setDescription('Accion cancelada')
                        msg.edit({ embeds: [Embed] })
                                                return
                    }

                    const EmbedConfirm = new EmbedBuilder()
                    .setDescription("Apagando sistema...\n\n\n||Es probable que tengas que volver a ejecutar este comando mas de 2 veces||")
                    msg.edit({ embeds: [EmbedConfirm], })

                    await msg.react('✅')
                    client.destroy()
                    process.exit(1)
                })
            })

        } else if(args[0] === "killWebServer") {
            const Embed = new EmbedBuilder()
            .setDescription('Estas seguro que quieres forzar esta funcion?, esto dejara al bot sin acceso a la api de Top.gg usada para votar\n\n en caso de estar seguro escribe `confirm`')
            .setColor(Colors.Yellow)
            .setFooter({ text: `PancyBot v${version} | Dev Funtions`, iconURL: client.user.avatarURL() })
            
            const msg_filter = (m) => m.author.id === message.author.id && m.channelId === message.channelId;
            const collector = message.channel.awaitMessages({ time: 15000, filter: msg_filter, max: 1 })

            message.reply({ embeds: [Embed] }).then(async msg => {
                collector.then(async x => {
                    const actionConfirm = x.first().content 
                    if(!actionConfirm) {
                        Embed.setDescription('Accion cancelada')
                        msg.edit({ embeds: [Embed] })
                                                return
                        
                    }
                    if(actionConfirm !== 'confirm') {
                        Embed.setDescription('Accion cancelada')
                        msg.edit({ embeds: [Embed] })
                                                return
                    }

                    const EmbedConfirm = new EmbedBuilder()
                    .setDescription("Apagando la pagina local...")
                    .setColor('Red')
                    .setTimestamp()
                    msg.edit({ embeds: [EmbedConfirm], })

                    Server.close()
                    await msg.react('✅')
                })
            })
        } else if(args[0] === "update") {
            exec('git pull', async (err, stdout, stderr) => {
                if (err) {
                    logs.error(err as unknown as string)
                    return
                }
                if (stderr) {
                    logs.error(stderr)
                    return
                }
                logs.info(stdout);
            })
        }
        else {
            message.reply('No existe la funcion')
        }
    }
})