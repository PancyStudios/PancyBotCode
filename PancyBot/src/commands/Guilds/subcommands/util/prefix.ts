import { Command } from "../../../../Structure/CommandSlash";
import { EmbedBuilder } from "discord.js";
export default new Command({
    name: "prefix",
    description: "Muestra el prefijo actual",
    category: "util",
    isDev: false,
    botPermissions: ["EmbedLinks"],

    async run({ interaction }) {
        const embed = new EmbedBuilder()
        .setTitle('Comando Deshabilitado')
        .setColor('Red')
        .setDescription(`Este comando ha sido deshabilitado temporalmente\n
            proximamente los comandos por mensaje seran reactivados`)
        .setFooter({ text: `💫 - PancyStudios | ${interaction.guild.name}`, iconURL: interaction.user.displayAvatarURL() });

        interaction.reply({ embeds: [embed], ephemeral: true });
    }
})