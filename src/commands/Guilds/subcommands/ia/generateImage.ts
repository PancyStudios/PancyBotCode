import { sendImage } from "../../../../Utils/Functions/sendImage";
import { errorHandler } from '../../../..';
import { Command } from "../../../../Structure/CommandSlash";
import { EmbedBuilder, Colors, ApplicationCommandOptionType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } from "discord.js";
import tougt from 'tough-cookie'
import { wrapper } from 'axios-cookiejar-support'
import path from "path"
import fs from "fs"
import axios from "axios";
import request from 'request-promise-native'
import { CraiyonResponse } from "../../../../Types/Craiyon";

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
        },
        {
            name: 'negative_prompt',
            type: ApplicationCommandOptionType.String,
            description: 'Describe lo que no se debe generar',
            required: false
        },
        {
            name: 'model',
            type: ApplicationCommandOptionType.String,
            description: 'Modelo de la IA',
            required: false,
            choices: [
                {
                    name: "Arte",
                    value: "art"
                }
            ]
        }
    ],

    async run({ interaction, args }) {
        const text = args.getString('prompt')
        const negativeText = args.getString('negative_prompt') || ''
        const model = args.getString('model') || 'art'
        try {
            await interaction.reply("Generando (Espere 1min aprox)...")

            const firstTime = Date.now()
            const axio = wrapper(axios)

            const jar = new tougt.CookieJar()
            const { data } = await request('https://api.craiyon.com/v3', {
                method: 'POST',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: {
                    prompt: text,
                    negative_prompt: negativeText,
                    model: model,
                    token: process.env.craiyonToken
                },
                jar: true,
                json: true
            })

            console.log(data)

            await interaction.editReply({ content: null, embeds: [
                new EmbedBuilder()
                .setTitle('Craiyon API')
                .setDescription(`Imagenes generadas exitosamente
                Tiempo de respuesta: ${Date.now() - firstTime}ms
                
                Espere un momento se estan descargando las imagenes generadas y subiendo a la api`)
            ]})

            if(!data.images) return await interaction.editReply({ content: "La api no entrego ninguna imagen, intentelo de nuevo", embeds: [] })
            let ids: string[] = []
            for(const image of data.images) {
                const { data } = await axio.get<ArrayBuffer>("https://img.craiyon.com/" + image, { 
                    responseType: 'arraybuffer', 
                    withCredentials: true, 
                    jar: new tougt.CookieJar(),
                })
                
                const authString = `${process.env.username}:${process.env.password}`;
                const authBuffer = Buffer.from(authString, 'utf-8');
                const authBase64 = authBuffer.toString('base64');
                const id = crypto.randomUUID()
                const name = `craiyon${id}.png`
                ids.push(id)
                const buffer = Buffer.from(data);
                fs.writeFileSync(buffer, path.join(__dirname, '../../../../', '/temp', '/images', name))
                try {
                    await sendImage(path.join(__dirname, '../../../../', '/temp', '/images', name), `${process.env.imageDbUrl}upload`, name, authBase64)
                } catch {
                    console.warn('No se pudo cargar la imagen')
                }
            }
            const Embed = new EmbedBuilder()
            .setTitle('Imagen generada')
            .setImage(`https://img.craiyon.com/${data.images[0]}`)
            .setColor(Colors.Green)
            .setDescription(`💫 - Powered by CraiyonAPI | PancyStudios`)

            const SelectMenu = new StringSelectMenuBuilder()
            .setCustomId('image')
            .setPlaceholder('Selecciona una imagen')
            .addOptions(
                [
                    new StringSelectMenuOptionBuilder()
                    .setLabel('Imagen 1')
                    .setValue(data.images[0])
                    .setDescription('Imagen generada')
                    .setEmoji('🖼️'),
                    new StringSelectMenuOptionBuilder()
                    .setLabel('Imagen 2')
                    .setValue(data.images[1])
                    .setDescription('Imagen generada')
                    .setEmoji('🖼️'),
                    new StringSelectMenuOptionBuilder()
                    .setLabel('Imagen 3')
                    .setValue(data.images[2])
                    .setDescription('Imagen generada')
                    .setEmoji('🖼️'),
                    new StringSelectMenuOptionBuilder()
                    .setLabel('Imagen 4')
                    .setValue(data.images[3])
                    .setDescription('Imagen generada')
                    .setEmoji('🖼️'),
                    new StringSelectMenuOptionBuilder()
                    .setLabel('Imagen 5')
                    .setValue(data.images[4])
                    .setDescription('Imagen generada')
                    .setEmoji('🖼️'),
                    new StringSelectMenuOptionBuilder()
                    .setLabel('Imagen 6')
                    .setValue(data.images[5])
                    .setDescription('Imagen generada')
                    .setEmoji('🖼️'),
                    new StringSelectMenuOptionBuilder()
                    .setLabel('Imagen 7')
                    .setValue(data.images[6])
                    .setDescription('Imagen generada')
                    .setEmoji('🖼️'),
                    new StringSelectMenuOptionBuilder()
                    .setLabel('Imagen 8')
                    .setValue(data.images[7])
                    .setDescription('Imagen generada')
                    .setEmoji('🖼️'),
                    new StringSelectMenuOptionBuilder()
                    .setLabel('Imagen 9')
                    .setValue(data.images[8])
                    .setDescription('Imagen generada')
                    .setEmoji('🖼️'),
                ]
            )
            await interaction.editReply({ embeds: [Embed], components: [new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(SelectMenu)] })
            let whileT = true
            do {

            } while(whileT)
        } catch (error) {
            console.error(error)
                const Errorinteraction = new EmbedBuilder()
                .setTitle("Craiyon Error")
                .setDescription(`Error: ${error}`)
                .setColor(Colors.Red)
                .setTimestamp()

                interaction.editReply({ embeds: [Errorinteraction] })

                errorHandler.report({ error: "Craiyon", message: error })
        }
    }
})

