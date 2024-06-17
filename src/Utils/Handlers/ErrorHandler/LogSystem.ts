import { WebhookClient, Colors, EmbedBuilder } from 'discord.js'
const Webhook = new WebhookClient({ url: process.env.logsWebhook })

export class Logs {
    constructor(){
        this.info("[LOGS] Sistema de log iniciado")
    }

    debug(log: string) {
        console.debug(log)
        this.debugDiscord(log)
    }

    info(log: string) {
        console.info(log)
        this.infoDiscord(log)
    }

    log(log: string) {
        console.log(log)
        this.logDiscord(log)
    }

    error(log: string) {
        console.error(log)
        this.errorDiscord(log)
    }

    warn(log: string) {
        console.warn(log)
        this.warnDiscord(log)
    }

    async debugDiscord(log: string) {
        await Webhook.rest.globalDelay
        const Embed = new EmbedBuilder()
        .setDescription(`${log}`)
        .setFooter({ text: `Rate limit: ${Webhook.rest.globalRemaining}`})
        .setColor(Colors.Blue)
        .setTimestamp()

        Webhook.send({ embeds: [Embed] })
    }

    async infoDiscord(log: string) {
        await Webhook.rest.globalDelay
        const Embed = new EmbedBuilder()
        .setDescription(`${log}`)
        .setFooter({ text: `Rate limit: ${Webhook.rest.globalRemaining}`})
        .setColor(Colors.Aqua)
        .setTimestamp()

        Webhook.send({ embeds: [Embed] })
    }

    async logDiscord(log: string) {
        await Webhook.rest.globalDelay
        const Embed = new EmbedBuilder()
        .setDescription(`${log}`)
        .setFooter({ text: `Rate limit: ${Webhook.rest.globalRemaining}`})
        .setColor(Colors.Greyple)
        .setTimestamp()

        Webhook.send({ embeds: [Embed] })
    }

    async errorDiscord(log: string) {
        await Webhook.rest.globalDelay
        const Embed = new EmbedBuilder()
        .setDescription(`${log}`)
        .setFooter({ text: `Rate limit: ${Webhook.rest.globalRemaining}`})
        .setColor(Colors.Red)
        .setTimestamp()

        Webhook.send({ embeds: [Embed] })
    }

    async warnDiscord(log: string) {
        await Webhook.rest.globalDelay
        const Embed = new EmbedBuilder()
        .setDescription(`${log}`)
        .setFooter({ text: `Rate limit: ${Webhook.rest.globalRemaining}`})
        .setColor(Colors.Yellow)
        .setTimestamp()

        Webhook.send({ embeds: [Embed] })
    }
}