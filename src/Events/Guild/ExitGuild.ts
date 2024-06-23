import { Event } from "../../Structure/Events";
import { logs } from "../..";
import { EmbedBuilder, Colors, WebhookClient } from "discord.js";

const Webhook = new WebhookClient({ url: process.env.guildsWebhook })

export default new Event("guildDelete", async guild => {
    logs.warn(`He sido eliminado de un servidor: ${guild.name} (${guild.id})`)

    const ExitGuildEmbed = new EmbedBuilder()
        .setTitle("Servidor eliminado")
        .setDescription(`
            He sido eliminado de un servidor: ${guild.name} (${guild.id})
            Dueño: ${guild.members.cache.get(guild.ownerId).user.tag} (${guild.ownerId})
            `)
        .setColor(Colors.Red)
        .setTimestamp()

    Webhook.send({ embeds: [ExitGuildEmbed] })
})