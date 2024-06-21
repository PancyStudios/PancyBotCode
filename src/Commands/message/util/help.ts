import { Command } from "../../../Structure/CommandMsg";
import { EmbedBuilder, Colors } from "discord.js";
const prefix = 'pan!'

export default new Command({
    name: "help",
    description: "Comando de ayuda",
    category: "util",
    use: "",
    isDev: false,
    botPermissions: ["EmbedLinks"],
    async run({ client, message }) {
        const HelpEmbed = new EmbedBuilder()
        .setTitle(client.user.username)
        .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })
        .setColor(Colors.Blurple)
        .setDescription(`
            **📚 | Comandos de ayuda**
            \`\`\`${prefix}help\`\`\` Muestra los comandos basicos
            \`\`\`${prefix}invite\`\`\` Muestra la invitacion del bot
            \`\`\`${prefix}commands\`\`\` Muestra la lista de comandos
            \`\`\`${prefix}commands [Command]\`\`\` Muestra informacion sobre un comando
            \`\`\`<BotMention> prefix\`\`\` Muestra el prefijo actual
        `)
        message.reply({ embeds: [HelpEmbed] });
    }
})
    