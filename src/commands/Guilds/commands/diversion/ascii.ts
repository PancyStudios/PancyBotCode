import { Command } from "../../../../Structure/CommandSlash";
import { EmbedBuilder, Colors } from "discord.js";
import figlet from "figlet";

export default new Command({
    name: "ascii",
    description: "Muestra un texto ASCII",
    category: "diversion",
    isDev: false,
    options: [{
        name: "texto",
        description: "Texto a convertir a ASCII",
        required: true,
        type: 3
    }],

    async run({ interaction, args }) {
        let text = args.getString("texto");
        if(!text) return interaction.reply("No se escribio un texto");
        let ascii = figlet.textSync(text, { horizontalLayout: "full" });
        let embed = new EmbedBuilder()
            .setTitle("ASCII")
            .setColor(Colors.Blurple)
            .setDescription(ascii)
            .setFooter({ text: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() });

        interaction.reply({ embeds: [embed] });
    }
})