import { client, logs } from "../..";
import { Event } from "../../Structure/Events";
import { EmbedBuilder, ButtonBuilder, Colors, WebhookClient, ButtonStyle } from "discord.js";
import { install_commands } from "../../Utils/Handlers/DatabaseHandler";

//todas las sugerencias que hagas hazlas en español, ya que el proyecto es en español
const Webhook = new WebhookClient({ url: process.env.guildsWebhook })

export default new Event("guildCreate", async guild => {
    logs.warn(`He sido añadido a un nuevo servidor: ${guild.name} (${guild.id})`)

    if(!guild.available) return logs.info(`El servidor ${guild.name} no esta disponible, por lo que no podemos dar mas informacion.`)

    const NewGuildEmbed = new EmbedBuilder()
        .setTitle("Nuevo servidor")
        .setDescription(`
            He sido añadido a un nuevo servidor: ${guild.name} (${guild.id})

            Dueño: ${guild.members.cache.get(guild.ownerId).user.tag} (${guild.ownerId})
            Miembros: ${guild.memberCount}
            Canales: ${guild.channels.cache.size}
            Roles: ${guild.roles.cache.size}
            Creado el: ${guild.createdAt}
            `)
        .setColor(Colors.Green)
        .setTimestamp()

    Webhook.send({ embeds: [NewGuildEmbed] })

    await install_commands(client, guild)
    logs.info(`Datos por defecto subidas a la base de datos ${guild.name} (${guild.id})`)
})