import { firefox, Browser, Page } from "playwright";
import { Command } from "../../../../Structure/CommandSlash";
import { ApplicationCommandOptionType, channelLink, ChannelType, EmbedBuilder } from "discord.js";

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
        if(interaction.channel.type === ChannelType.GuildText) {
            if(interaction.channel.nsfw) {
                try {
                    const context = await browser.newContext();
                    const page: Page = await context.newPage();
                    await page.goto(url);
                    const buffer = await page.screenshot();
                    await interaction.followUp({ embeds: [new EmbedBuilder().setImage("attachment://screenshot.png")], files: [{ attachment: buffer, name: "screenshot.png" }] });
                    await browser.close()
                } catch (err) {
                    await interaction.followUp({ 
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('Firefox | Error al tomar captura de pantalla')
                            .setDescription(`Ocurrio un error al intentar acceder a la pagina web, ${err}\n\nIntenta mas tarde`)
                            .setColor("Red")
                            .setFooter({ text: `Cloudflare dns | Squid Proxy | PancyProxy` })
                        ],
                        ephemeral: true
                    }); 
                    browser.close()
                }
            } else {
                try {
                    const context = await browser.newContext({
                        proxy: {
                            server: 'http://10.0.0.213:3128', // Puerto por defecto de Squid
                        }
                    });
                    const page: Page = await context.newPage();
                    await page.goto(url);
                    const buffer = await page.screenshot();
                    await interaction.followUp({ embeds: [new EmbedBuilder().setImage("attachment://screenshot.png")], files: [{ attachment: buffer, name: "screenshot.png" }], ephemeral: true });
                    await browser.close()
                } catch (err) {
                    const errorMessage = (err as Error).message?.split('\n')[0];
                    await interaction.followUp({ 
                        embeds: [
                            new EmbedBuilder()
                            .setTitle('PancyProxy | Solicitud bloqueada')
                            .setDescription(`Es probable que la solicitud haya sido bloqueada por el proxy local, intenta en un canal de nsfw o intenta mas tarde\n\n${errorMessage}`)
                            .setColor("Red")
                            .setFooter({ text: `Cloudflare dns | Squid Proxy | PancyProxy` })
                        ],
                        ephemeral: true
                    }); 
                    browser.close()
                }
            }
        }
    }
})