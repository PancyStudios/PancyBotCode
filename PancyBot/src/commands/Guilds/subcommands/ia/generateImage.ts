import { errorHandler, utils } from '../../../../index';
import { Command } from "../../../../Structure/CommandSlash";
import { EmbedBuilder, AttachmentBuilder, Colors } from "discord.js";
import { CraiyonResponse } from "../../../../Types/Craiyon";
import axios from "axios";

export default new Command({
    name: "createimage",
    description: "Genera una imagen",
    isDev: false,
    category: "ia",
    botPermissions: ["EmbedLinks"],
    options: [
        {
            name: "prompt",
            description: "Descripcion de la imagen a generar",
            type: 3,
            required: true
        }
    ],

    async run({ interaction, args }) {
        const text = args.getString('prompt', true)
        try {
            interaction.reply("Generando...").then(async msg => {
                const firstTime = Date.now()
                try {
                    const {status, data} = await axios.post<CraiyonResponse>('https://api.craiyon.com/v4', {
                        prompt: text,
                        token: process.env["craiyonToken "],
                        model: "auto",
                        negative_prompt: "",
                        size: "256x256"
                    }, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
                        },
                        maxRedirects: 2,
                        timeout: 240000,
                        validateStatus: function (status) {
                            return status >= 200 && status < 520; // Accept only 2xx status code
                        }
                    })

                    const randomNumber = Math.floor(Math.random() * 6)
                    const image = data.images[randomNumber]

                    switch (status) {
                        case 200:
                            await interaction.editReply({
                                content: "Imagen generada, enviando...", embeds: [
                                    new EmbedBuilder()
                                        .setImage(`https://img.craiyon.com/${image}`)
                                        .setColor(Colors.Red)
                                        .setFooter({
                                            text: `Tiempo de generacion: ${Date.now() - firstTime}ms | Craiyon`,
                                            iconURL: interaction.user.avatarURL()
                                        })
                                ]
                            })
                            break;

                        default:
                            const Errorinteraction = new EmbedBuilder()
                                .setTitle("Imagen no generada")
                                .setDescription(`CodeStatus: ${status}`)
                                .setColor(Colors.Red)
                                .setTimestamp()

                            interaction.editReply({embeds: [Errorinteraction]})
                            break;
                    }

                } catch (error) {
                    const Errorinteraction = new EmbedBuilder()
                        .setTitle("Craiyon Error")
                        .setDescription(`Error: ${error}`)
                        .setColor(Colors.Red)
                        .setTimestamp()

                    interaction.editReply({embeds: [Errorinteraction]})

                    errorHandler.report({error: "Craiyon", message: error})
                    console.log(error)
                }
            })
        } catch (error) {
            const Errorinteraction = new EmbedBuilder()
                .setTitle("Craiyon Error")
                .setDescription(`Error: ${error}`)
                .setColor(Colors.Red)
                .setTimestamp()

            interaction.channel.send({embeds: [Errorinteraction]})

            errorHandler.report({error: "Craiyon", message: error})
            console.log(error)
        }
    }
})

