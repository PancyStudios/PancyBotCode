import { Command } from "../../../../Structure/CommandSlash";
import axios from "axios";
import fs from "fs";
import { AttachmentBuilder, EmbedBuilder, Colors, ApplicationCommandOptionType } from "discord.js";
import path from "path"

export default new Command({
    name: "getimage",
    description: "Pide una imagen generada anteriormente",
    category: "ia",
    options: [
        {
            name: 'id',
            description: 'ID de la imagen',
            required: true,
            type: ApplicationCommandOptionType.String
        }
    ],

    run: async ({ interaction, args }) =>{
        const id = args.getString('id')
        try {  
            const {status} = await axios.get(process.env.imageDbUrl + "image/craiyon/craiyon"+id+".png")
            if(status === 200 || status === 201 || status === 204 || status === 304) {
                return interaction.reply({ embeds: [new EmbedBuilder({
                    title: "Imagen solicitada",
                    image: { url: process.env.imageDbUrl + "image/craiyon/craiyon"+id+".png" },
                    timestamp: new Date(),
                    color: Colors.Red,
                })]})
            }
        } catch(err) {
            const BufferImage = fs.readFileSync(path.join(__dirname, "../../../", "temp/images", `craiyon${id}.png`))
            if(!BufferImage) return interaction.reply('No existe esta imagen')

            const image = new AttachmentBuilder(BufferImage, { name: `craiyon${id}.png`})

            interaction.reply({ content: "Imagen solicitada ||(ADVERTENCIA ESTA NO ESTA GUARDADA EN LA NUBE, PUEDE SER BORRADA EN CUALQUIER MOMENTO)||", files: [image] })
        }
    }
})