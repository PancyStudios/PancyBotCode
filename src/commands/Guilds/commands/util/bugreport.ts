import { Command } from "../../../../Structure/CommandSlash";
import { EmbedBuilder, WebhookClient, ButtonBuilder, ButtonStyle, ActionRowBuilder, ApplicationCommandOptionType, MessageActionRowComponentBuilder } from "discord.js";
import { version } from "../../../../../package.json";

const Webhook = new WebhookClient({ url: process.env.bugsWebhook })

export default new Command({
    name: "bugreport",
    description: "Reporta un bug",
    category: 'util',
    options: [
        {
            name: "bug",
            description: "Describe el bug",
            type: ApplicationCommandOptionType.String,
            required: true,
            min_length: 15,
        }, 
        {
            name: "image",
            description: "Sube una imagen / video del bug",
            type: ApplicationCommandOptionType.Attachment,
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
                    > # Se a reportado un bug desde el servidor: 
                    > ${interaction.guild.name} (${interaction.guild.id})

                    > El bug reportado es el siguiente: ${bug}

                    > Archivo adjunto: ${attachment.url}
                `)
            .setColor("Red")
            .setTimestamp()
            .setFooter({ text: `PancyBot ${version}`, iconURL: client.user.displayAvatarURL() })
        await Webhook.send({ embeds: [Embed] })

        const EmbedReply = new EmbedBuilder()
            .setTitle("Bug Report")
            .setDescription("Tu bug reportado ha sido enviado con exito\n\nPara un mejor seguimiento del bug recomendamos que lo reportes en el github del bot")
            .setColor("Green")
            .setTimestamp()

        const ButtonGithub = new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Github")
            .setURL("https://github.com/PancyBot/PancyBotCode/issues/new")
            .setEmoji(":PB_github:1254325934396411935")

        const ActionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
            .addComponents(ButtonGithub)

        return interaction.followUp({ embeds: [EmbedReply], components: [ActionRow],ephemeral: true})
    }
})