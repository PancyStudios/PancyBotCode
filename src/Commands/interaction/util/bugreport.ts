import { Command } from "../../../Structure/CommandSlash";
import { EmbedBuilder, WebhookClient } from "discord.js";
import { version } from "../../../../package.json";

const Webhook = new WebhookClient({ url: process.env.bugsWebhook })

export default new Command({
    name: "bugreport",
    description: "Reporta un bug",
    options: [
        {
            name: "bug",
            description: "Describe el bug",
            type: 3,
            required: true
        }, 
        {
            name: "image",
            description: "Sube una imagen / video del bug",
            type: 11,
            required: true,
        }
    ],
    run: async ({ interaction, args, client }) => {
        const bug = args.getString("bug")
        const attachment = args.getAttachment("image")

        const Embed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setTitle("Bug Report")
            .setDescription(`
                    Se a reportado un bug desde el servidor ${interaction.guild.name} (${interaction.guild.id})
                    El bug reportado es el siguiente: ${bug}
                    Archivo adjunto: ${attachment.url}
                `)
            .setImage(attachment.url)
            .setColor("Red")
            .setTimestamp()
            .setFooter({ text: `PancyBot ${version}`, iconURL: client.user.displayAvatarURL() })
        await Webhook.sendSlackMessage({ embeds: [Embed] })

        const EmbedReply = new EmbedBuilder()
            .setTitle("Bug Report")
            .setDescription("Tu bug reportado ha sido enviado con exito")
            .setColor("Green")
            .setTimestamp()


    }
})