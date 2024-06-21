import { Command } from "../../../Structure/CommandMsg";
import { EmbedBuilder } from "discord.js";
const prefix = 'pan!'

export default new Command({
    name: "prefix",
    description: "Muestra el prefijo actual",
    category: "util",
    use: "",
    isDev: false,
    botPermissions: ["EmbedLinks"],

    async run({ message }) {
        let embed = new EmbedBuilder()
            .setTitle("Este es el prefix actual")
            .setColor("Blue")
            .setDescription(`\`${prefix}\``)
            .setFooter({ text: "Powered by CacheSystem", iconURL: message.author.displayAvatarURL() });

        message.reply({ embeds: [embed] });
    }
})