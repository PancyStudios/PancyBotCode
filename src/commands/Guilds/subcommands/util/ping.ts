import { Command } from "../../../Structure/CommandMsg";
import { Guild } from "../../../../Database/BotDataBase";
import ms from "ms";

export default new Command({
  name: "ping",
  description: "Command info",
  category: "util",
  use: "",
  database: true,

  async run({ message, args, client }) {
    try {
      message
        .reply({ content: "Obteniendo informacion..." })
        .then(async (m) => {
          let ping = m.createdTimestamp - message.createdTimestamp;
          m.edit({
            content: `:globe_with_meridians: Mensajes/ms: ${ping} \n:robot: Websocket/Discord Api: ${client.ws.ping}`,
          }).then(async (x) => {
            let timestamp = new Date().getMilliseconds();
            Guild.findOne({ id: message.guild.id }).then(() => {
              let now = new Date().getMilliseconds();
              timestamp = now - timestamp;
            });
            ping = ping - timestamp;
            if (ping < 0) ping = ping + timestamp;
            m.edit({
              content: `:globe_with_meridians: Mensajes: ${ms(
                ping
              )}\n:robot: Discord Api: ${ms(client.ws.ping)}\n📚 Database: ${ms(
                timestamp
              )}`,
            });
          });
        });
    } catch (err) {
      message.reply(err);
    }
  },
});
