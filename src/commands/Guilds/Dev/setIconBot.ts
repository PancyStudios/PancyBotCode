import { Command } from "../../../Structure/CommandSlash";
import { EmbedBuilder, Colors, ApplicationCommandOptionType } from "discord.js";


export default new Command({
    name: "seticon",
    description: "Establece el icono del bot",
    category: "dev",
    options: [
        {
            name: 'image',
            description: 'Imagen a establecer como icono del bot',
            type: ApplicationCommandOptionType.Attachment,
            required: true
        }
    ],
    isDev: true,
    botPermissions: ["EmbedLinks"],
    async run({ interaction, args, client }) {

    }
})
