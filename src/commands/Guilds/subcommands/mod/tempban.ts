import { Command } from "../../../../Structure/CommandSlash"
import { EmbedBuilder } from "discord.js"
import ms from "ms"

export default new Command({
    name: "tempban",
    description: "Banea temporalmente a alguien",
    category: "mod",
    userPermissions: ["BanMembers"],
    botPermissions: ["EmbedLinks", "BanMembers"],

    run: async ({ interaction }) => {
        interaction.reply('Commando en desarrollo')
    }
})