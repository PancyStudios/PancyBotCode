import { EmbedBuilder } from "@discordjs/builders";
import { Colors, GuildMember, TextChannel, User } from "discord.js"
import { Command } from "../../../../Structure/CommandSlash";

export default new Command({
  name: "ban",
  description: "Banea a un usuario del servidor",
  category: "mod",
  userPermissions: ["BanMembers"],
  botPermissions: ["BanMembers", "EmbedLinks"],
  options: [
    {
      name: "usuario",
      description: "Usuario a banear",
      type: 6,
      required: false,
    },
    {
      name: "user_id",
      description: "ID del usuario a banear",
      type: 3,
      required: false
    },
    {
      name: "username",
      description: "Nombre del usuario a banear",
      type: 3,
      required: false
    },
    {
      name: "razon",
      description: "Razon del baneo",
      type: 3,
      required: false
    }
  ],

  async run({ client, interaction, args }) {
    const memberOption = args.getMember("usuario")
    const idOption = args.getString("user_id")
    const usernameOption = args.getString("username")
    const reason = args.getString("razon")
    
    if(!(memberOption || idOption || usernameOption)) return interaction.reply({ content: "Debes que mencionar a un usuario.", ephemeral: true });
    const embed = new EmbedBuilder()
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });

    if (!args[0]) {
      embed.setDescription("Debes que mencionar a un usuario.");
      embed.setColor(Colors.Red);
      return interaction
        .reply({ embeds: [embed] })
        .then((m) => {
          setTimeout(() => {
            m.delete()
          }, 3000)
        });
    }

    let member =
      memberOption as GuildMember ||
      interaction.guild.members.resolve(idOption) ||
      interaction.guild.members.cache.find(
        (m) => m.user.username.toLowerCase() == usernameOption.toLowerCase()
      ) ||
      (await client.users.fetch(idOption));
    if (!member || member.id == interaction.user.id) {
      embed.setDescription("Debes que mencionar a un usuario.");
      embed.setColor(Colors.Red);
      return interaction.reply({ embeds: [embed] });
    }


    if (interaction.guild.members.resolve(member.id)) {
      if (
        interaction.member.roles.highest.comparePositionTo((member as GuildMember).roles.highest) <=
        0
      ) {
        embed.setDescription(
          "No puedes banear a un usuario con mayor o igual nivel jerarquico que tu."
        );
        embed.setColor(Colors.Red);
        return interaction.reply({ embeds: [embed] });
      }
      if (!(member as GuildMember).bannable) {
        embed.setDescription("No puedo banear a este usuario");
        embed.setColor(Colors.Red);
        return interaction.reply({ embeds: [embed] });
      }
    }
    let razon = reason != ''
      ? reason
      : "Razon sin especificar";
    interaction.guild.members.ban(member.id, {
      reason: `${interaction.user.tag} - ${razon}`,
    });
    embed
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .setThumbnail(
        !!(member as GuildMember).user
          ? (member as GuildMember).user.displayAvatarURL()
          : member.displayAvatarURL()
      )
      .setTitle("Baneo exitoso ")
      .addFields([
        {
          name: "> Usuario Baneado",
          value: !!(member as any).user ? (member as GuildMember).user.tag : (member as User).tag
        },
        {
          name: "> Razón:",
          value: razon
        },
        {
          name: "> ID del Moderador:",
          value: interaction.user.id
        },
        {
          name: "> ID del Servidor:",
          value: interaction.guild.id
        }
      ])
      .setColor(Colors.Aqua)
      .setTimestamp();

    if (!!(member as any).user) (member as any).user.send({ embeds: [embed] }).catch((e) => e);
    interaction.reply({ embeds: [embed] });
  }
})