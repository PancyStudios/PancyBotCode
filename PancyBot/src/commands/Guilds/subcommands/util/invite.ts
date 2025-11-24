
import { Command } from "../../../../Structure/CommandSlash";
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export default new Command({
    name: "invite",
    description: "Invitacion del bot",
    category: "util",
    isDev: false,
    botPermissions: ["EmbedLinks"],
    async run({ interaction, client }) {
        const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
            .setLabel('Invite')
            .setURL("https://discord.com/api/oauth2/authorize?client_id="+client.user.id+"&permissions=8&scope=bot%20applications.commands")
            .setStyle(ButtonStyle.Link)
        )

        let embed = new EmbedBuilder()
            .setTitle("Invitacion del bot")
            .setColor("Blurple")
            .setDescription(`Puedes apoyarme invitandome a tu servidor con el boton de abajo`)
            .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });

        interaction.reply({ embeds: [embed], components: [row] });
    }   
})