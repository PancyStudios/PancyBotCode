import { Command } from "../../../../Structure/CommandSlash";
import { EmbedBuilder, Colors } from "discord.js";
import nekos from "nekos.life";
const neko = new nekos();

export default new Command({
    name: "dog",
    description: "Muestra una imagen de un perro",
    category: "diversion",
    botPermissions: ["EmbedLinks"],
    isDev: false,

    async run({ interaction }) {
        let imagen = await neko.woof() 
        // Funcion temporalmente deshabilitada
        // const randomPorcentage = Math.floor(Math.random() * 100)
        // if(randomPorcentage > 90) {
        //     imagen.url = "https://media.discordapp.net/attachments/970050180965597234/1001279578943275080/IMG-20220618-WA0009.jpg?width=630&height=473"
        // }
        let embed = new EmbedBuilder()
            .setTitle("🐕")
            .setColor('#F8A269')
            .setImage(imagen.url)
            .setFooter({ text: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL()});

        interaction.reply({ embeds: [embed] });
    }
})