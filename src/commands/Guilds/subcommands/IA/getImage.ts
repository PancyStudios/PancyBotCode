import { Command } from "../../../../Structure/CommandSlash";
import axios from "axios";
import fs from "fs";
import { AttachmentBuilder, EmbedBuilder, Colors } from "discord.js";
import path from "path"

export default new Command({
    name: "getimage",
    description: "Pide una imagen generada anteriormente",
    category: "ia",

    run: async ({ interaction, args }) =>{
        if(!args[0]) return interaction.reply('Proporciona una ID')
        try {  
            const {status} = await axios.get(process.env.imageDbUrl + "image/craiyon/craiyon"+args[0]+".png")
            if(status === 200 || status === 201 || status === 204 || status === 304) {
                return interaction.reply({ embeds: [new EmbedBuilder({
                    title: "Imagen solicitada",
                    image: { url: process.env.imageDbUrl + "image/craiyon/craiyon"+args[0]+".png" },
                    timestamp: new Date(),
                    color: Colors.Red,
                })]})
            }
        } catch(err) {
            const BufferImage = fs.readFileSync(path.join(__dirname, "../../../", "temp/images", `craiyon${args[0]}.png`))
            if(!BufferImage) return interaction.reply('No existe esta imagen')

            const image = new AttachmentBuilder(BufferImage, { name: `craiyon${args[0]}.png`})

            interaction.reply({ content: "Imagen solicitada ||(ADVERTENCIA ESTA NO ESTA GUARDADA EN LA NUBE, PUEDE SER BORRADA EN CUALQUIER MOMENTO)||", files: [image] })
        }
    }
})