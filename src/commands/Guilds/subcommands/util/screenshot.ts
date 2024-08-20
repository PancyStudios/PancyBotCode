import { firefox, Browser, Page } from "playwright";
import { Command } from "../../../../Structure/CommandSlash";
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";

export default new Command({
    name: "screenshot",
    description: "Toma una captura de pantalla de una pagina web",
    category: "util",
    isDev: false,
    botPermissions: ["EmbedLinks"],
    options: [
        {
            name: "url",
            description: "La url de la pagina web",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],

    run: async ({ interaction }) => {
        const url = interaction.options.getString("url", true);
        await interaction.deferReply();
        const browser: Browser = await firefox.launch();
        const context = await browser.newContext({
            proxy: {
                server: 'http://localhost:3128', // Puerto por defecto de Squid
            }
        });
        const page: Page = await context.newPage();
        await page.goto(url);
        const buffer = await page.screenshot();
        await interaction.followUp({ embeds: [new EmbedBuilder().setImage("attachment://screenshot.png")], files: [{ attachment: buffer, name: "screenshot.png" }] });
        await browser.close()
    }
})