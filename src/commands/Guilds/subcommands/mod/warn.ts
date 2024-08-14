import { Command } from "../../../Structure/CommandMsg";
import { warns as Warns } from "../../../../Database/Warns";
import { utils } from '../../../..';
import { EmbedBuilder } from "discord.js";

const prefix = 'pan!'

export default new Command({
  name: "warn",
  description: "Warn a user",
  category: "mod",
  use: "<user> <reason>",
  userPermissions: ["ManageMessages"],
  botPermissions: ["ManageRoles"],
  database: true,

  run: async ({ message, args }) => {
    let reason = (args.slice(1) as string[]).join(" ");
    let userMention = message.mentions.members.first();
    if (!userMention)
      return message.reply(
        await utils.dataRequired(
          "No se menciono a nadie.\n\n" +
            prefix +
            "warn <userMention> [reason]"
        )
      );
    if (!reason) reason = `Sin especificar.`;

    let userWarns = await Warns.findOne({
      guildId: message.guild.id,
      userId: userMention.id,
    });
    if (userWarns) {
      userWarns.warns.push({
        reason: reason,
        moderator: message.author.id,
      });
      userWarns.save();
    } else {
      let newUser = new Warns({
        guildId: message.guild.id,
        userId: userMention.id,
        warns: [
          {
            reason: reason,
            moderator: message.author.id,
          },
        ],
        subCount: 0,
      });
      userWarns = newUser;
      newUser.save();
    }

    message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x0056ff)
          .setDescription(
            `<@${userMention.id}>, Has sido advertido tienes ${
              userWarns.warns.length
            } Warns\n\nRazón: \`${
              (args as Array<string>).join(" ").split(`${userMention.id}> `)[1]
            }\`\nModerador: \`${message.author.tag}\``
          ),
      ],
    });
  },
});
