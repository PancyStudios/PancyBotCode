import {Command} from "../../../../Structure/CommandSlash";
import {ApplicationCommandOptionType, AttachmentBuilder, ChannelType, EmbedBuilder} from "discord.js";
import axios from "axios";

export default new Command({
    name: "screenshot",
    description: "Toma una captura de pantalla de una pagina web",
    category: "util",
    isDev: false,
    botPermissions: ["EmbedLinks"],
    options: [
        {
            name: "url",
            description: "La url de la pagina web",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],

    run: async ({ interaction }) => {
        const url = interaction.options.getString("url", true);
        await interaction.deferReply();

        try {
            const { data, status } = await axios.post<Buffer>('https://screenshot.pancy.miau.media/api/private/screenshot', {
                url
            }, {
                headers: {
                    Authorization: `Bearer ${process.env.authScreenshots}`,
                    Accept: 'image/png',
                },
                responseType: 'arraybuffer',
                maxRedirects: 2,
                timeout: 64000,
                validateStatus: function (status) {
                    return status >= 200 && status < 520; // Accept only 2xx status code
                }
            })
            console.debug(data + ' ' + status, 'ScreenShots')
            const image = new AttachmentBuilder(data, { name: `screenshot.png` })
            const embed = new EmbedBuilder()
                .setTitle("Captura de pantalla")
                .setImage(`attachment://screenshot.png`)
                .setColor('Blue')
                .setFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp()
            await interaction.followUp({ embeds: [embed], files: [image] })
        } catch (err) {
            console.error(err)
            const errorEmbed = new EmbedBuilder()
                .setTitle("Error")
                .setDescription(`No se pudo tomar la captura de pantalla, verifica la url o intenta nuevamente.\n\nError: ${err}`)
                .setColor('Red')
                .setFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp()
            await interaction.followUp({ embeds: [errorEmbed] })
        }
    }
})