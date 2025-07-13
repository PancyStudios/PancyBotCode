import { Command } from "../../../../../Structure/CommandSlash";
import { EmbedBuilder, Colors, ApplicationCommandOptionType } from "discord.js";


export default new Command({
    name: "seticon",
    description: "Establece el icono del bot",
    category: "dev",
    options: [{
        name: "icon",
        description: 'Avatar del bot',
        required: true,
        type: ApplicationCommandOptionType.Attachment,
    }],
    isDev: true,
    botPermissions: ["EmbedLinks"],
    async run({ interaction, args, client }) {
        const image = args.getAttachment("icon").url;
        if (!image) return interaction.reply("Debes especificar una imagen");
        let embed = new EmbedBuilder()
            .setTitle("Estableciendo icono del bot")
            .setColor(Colors.Yellow)
            .setDescription(`Estableciendo icono del bot...`)
            .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });

        const initial = Date.now();
        try {
            interaction.reply({ embeds: [embed] }).then(async msg => {
                await client.user.setAvatar(image);
                const postAvatar = Date.now();
                embed.setDescription(`${embed.data.description}\nIcono establecido en \`${postAvatar - initial}ms\``);
                embed.setColor(Colors.Green);
                await msg.edit({ embeds: [embed] });
                const RestartClientEmbed = new EmbedBuilder()
                    .setTitle("Reiniciando cliente")
                    .setColor(Colors.Orange)
                    .setDescription(`${embed.data.description}\nReiniciando cliente...`)
                    .setTimestamp()
                    .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });
                
                await interaction.channel.send({ embeds: [RestartClientEmbed] });
                const ie = Date.now();
                await client.destroy();
                await client.start();
                embed.setDescription(`${embed.data.description}\nCliente reiniciado en \`${Date.now() - ie}ms\``);
                embed.setColor(Colors.Yellow);
                await msg.edit({ embeds: [embed] })
                
            })
        } catch (e) {
            embed.setDescription(`Error: ${e.interaction}`);
        }
    }
})
