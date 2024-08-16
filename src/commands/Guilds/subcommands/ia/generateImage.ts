import { sendImage } from "../../../../Utils/Functions/sendImage";
import { craiyon, errorHandler } from '../../../..';
import { Command } from "../../../../Structure/CommandSlash";
import { EmbedBuilder, AttachmentBuilder, Colors, ApplicationCommandOptionType } from "discord.js";
import path from "path"
import fs from "fs"

export default new Command({
    name: "createimage",
    description: "Genera una imagen",
    isDev: false,
    category: "ia",
    botPermissions: ["EmbedLinks"],
    options: [
        {
            name: 'prompt',
            type: ApplicationCommandOptionType.String,
            description: 'Describe la imagen que quieres generar',
            required: true
        }
    ],

    async run({ interaction, args }) {
        const text = args.getString('prompt')
        try {
            interaction.reply("Generando...").then(async msg => {
                const firstTime = Date.now()
                await craiyon.generate({
                    prompt: `${text}`,
                    maxRetries: 1,
                }).then(async x => {

                    // Leer el contenido del archivo
                    const fileContent = fs.readFileSync('lastId.txt').toString();

                    // Convertir el contenido del archivo a un número
                    const number = parseInt(fileContent, 10);

                    const authString = `${process.env.username}:${process.env.password}`;
                    const authBuffer = Buffer.from(authString, 'utf-8');
                    const authBase64 = authBuffer.toString('base64');
                    const name = `craiyon${number + 1}.png`
                    const stream = x.images[0].asBuffer();
                    x.images[0].saveToFileSync(path.join(__dirname, '../../../', '/temp', '/images', name));

                    fs.writeFileSync('lastId.txt', `${number + 1}`);

                    const image = new AttachmentBuilder(stream, { name: "craiyon.png" })

                    const finalTime = Date.now() - firstTime;
                    msg.edit({ content: `Generado Craiyon ID Image: (${number + 1}) en: ${finalTime / 1000}s`, files: [image] })
                    try {
                        await sendImage(path.join(__dirname, '../../../', '/temp', '/images', name), `${process.env.imageDbUrl}upload`, name, authBase64)
                    } catch {
                        console.warn('No se pudo cargar la imagen')
                    }
                }).catch(err => console.error(err))
                .finally(() => console.log("done"))
            })
        } catch (error) {
                const Errorinteraction = new EmbedBuilder()
                .setTitle("Craiyon Error")
                .setDescription(`Error: ${error}`)
                .setColor(Colors.Red)
                .setTimestamp()

                interaction.editReply({ embeds: [Errorinteraction] })

                errorHandler.report({ error: "Craiyon", message: error })
                console.log(error)
        }
    }
})

