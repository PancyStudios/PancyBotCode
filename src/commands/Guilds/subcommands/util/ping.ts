import { Command } from "../../../../Structure/CommandSlash";
import ms from "ms";
import { database } from "../../../..";

export default new Command({
  name: "ping",
  description: "Command info",
  category: "util",
  database: true,

  async run({ interaction, args, client }) {
    try {
      interaction
        .reply({ content: "Obteniendo informacion..." })
        .then(async (m) => {
          let ping = m.createdTimestamp - interaction.createdTimestamp;
          m.edit({
            content: `:globe_with_meridians: Mensajes/ms: ${ping} \n:robot: Websocket/Discord Api: ${client.ws.ping}`,
          }).then(async (x) => {
            let timestamp = Date.now();
            const pingDb = await database.ping()
            let now = Date.now();
            timestamp = now - timestamp;
            ping = ping - timestamp;
            if (ping < 0) ping = ping + timestamp;
            m.edit({
              content: `:globe_with_meridians: Mensajes: ${ms(
                ping
              )}\n:robot: Discord Api: ${ms(client.ws.ping)}\n📚 Database: ${ms(
                pingDb
              )}`,
            });
          });
        });
    } catch (err) {
      interaction.reply(err);
    }
  },
});
