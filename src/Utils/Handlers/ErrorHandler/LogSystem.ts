import { WebhookClient, Colors, EmbedBuilder } from 'discord.js'
import { version } from '../../../../package.json'
const Webhook = new WebhookClient({url: 'https://discord.com/api/webhooks/1251721656049864804/3ZoJPbH5UcKpD7f7u8EvF5HbRowxIY5-3J4iZjcZXrvGFBkpbUdu9KYOIURC3cQb8Kcz' })

export class Logs {
    constructor(){}

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

    debugDiscord(log: string) {
        const Embed = new EmbedBuilder()
        .setDescription(log)
        .setColor(Colors.Blue)
        .setTimestamp()

        Webhook.send({ embeds: [Embed] })
    }

    infoDiscord(log: string) {
        const Embed = new EmbedBuilder()
        .setDescription(log)
        .setColor(Colors.Aqua)
        .setTimestamp()

        Webhook.send({ embeds: [Embed] })
    }

    logDiscord(log: string) {
        const Embed = new EmbedBuilder()
        .setDescription(log)
        .setColor(Colors.Greyple)
        .setTimestamp()

        Webhook.send({ embeds: [Embed] })
    }

    errorDiscord(log: string) {
        const Embed = new EmbedBuilder()
        .setDescription(log)
        .setColor(Colors.Red)
        .setTimestamp()

        Webhook.send({ embeds: [Embed] })
    }

    warnDiscord(log: string) {
        const Embed = new EmbedBuilder()
        .setDescription(log)
        .setColor(Colors.Yellow)
        .setTimestamp()

        Webhook.send({ embeds: [Embed] })
    }
}