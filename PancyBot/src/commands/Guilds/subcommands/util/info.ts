import { Command } from "../../../../Structure/CommandSlash";
import { EmbedBuilder } from "discord.js";
import { version, dependencies } from "../../../../../../package.json";
import moment from "moment";
import "moment-duration-format";

export default new Command({
  name: "info",
  description: "Command info",
  category: "util",

  async run({ interaction, args, client }) {
    const actividad = moment
      .duration(client.uptime)
      .format(" D [dias], H [hrs], m [mins], s [secs]");
    const botOwner = client.users.cache.get("711329342193664012");
    const desingerBot = client.users.cache.get("796650479673147422");
    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${client.user.tag} v${version}`,
        iconURL: client.user.avatarURL(),
      })
      .addFields([
        {
          name: "**⚒️ | Developer**",
          value: `\`\`\`${botOwner.tag}\`\`\``,
          inline: false,
        },
        {
          name: "**🎨 | Diseñador**",
          value: `\`\`\`${desingerBot.tag}\`\`\``,
          inline: false,
        },
        {
          name: "**⏳ | Uptime**",
          value: `> ${actividad}`,
          inline: true,
        },
        {
          name: "**🏓 | Ping**",
          value: `> ${client.ws.ping}ms`,
          inline: true,
        },
        {
          name: "**🖥️ | Servidores**",
          value: `> ${client.guilds.cache.size} Servidores`,
          inline: true,
        },
        {
          name: "**👥 | Usuarios**",
          value: `> ${client.users.cache.size} Usuarios`,
          inline: true,
        },
        {
          name: "**📜 | Canales**",
          value: `> ${client.channels.cache.size} Canales en cache`,
          inline: true,
        },
        {
          name: "**🔊 | Canales de voz**",
          value: `> ${client.voice.adapters.size} Canales conectados`,
          inline: true,
        },
        {
          name: "**📶 | Versión de node**",
          value: `> ${process.version}`,
          inline: true,
        },
        {
          name: "**📒 | Versión de Djs**",
          value: `> ${dependencies["discord.js"]}`,
          inline: true,
        },
        {
          name: "**👾 | Ram usada**",
          value: `> ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
            2
          )} MB`,
          inline: true,
        },
      ])
      .setColor("Yellow")
      .setThumbnail(client.user.avatarURL())
      .setFooter({
        text: "Lenguaje: TypeScript",
        iconURL: client.user.avatarURL(),
      });

    interaction.reply({ embeds: [embed] });
  },
});
