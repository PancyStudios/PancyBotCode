import { Command } from "../../../../Structure/CommandSlash";
import { EmbedBuilder, Colors } from "discord.js";

export default new Command({
    name: "help",
    description: "Comando de ayuda",
    category: "util",
    isDev: false,
    botPermissions: ["EmbedLinks"],
    async run({ client, interaction }) {
        const HelpEmbed = new EmbedBuilder()
        .setTitle(client.user.username)
        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
        .setColor(Colors.Blurple)
        .setDescription(`
            **📚 | Comandos de ayuda**
            \`\`\`/help\`\`\` Muestra los comandos basicos
            \`\`\`/node_modulesinvite\`\`\` Muestra la invitacion del bot
            \`\`\`/node_modulescommands\`\`\` Muestra la lista de comandos
            \`\`\`/commands [Command]\`\`\` Muestra informacion sobre un comando
        `)
        interaction.reply({ embeds: [HelpEmbed] });
    }
})
    