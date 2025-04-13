import { EmbedBuilder, Colors } from "discord.js";
import { Command } from "../../../../Structure/CommandSlash";

export default new Command({
  name: `ppt`,
  category: "diversion",
  description: `juega piedra papel o tijeras`,
  options: [
    {
      name: "move",
      description: "Elige una opcion",
      type: 3,
      required: true,
      choices: [
        {
          name: "Piedra",
          value: "piedra",
        },
        {
          name: "Papel",
          value: "papel",
        },
        {
          name: "Tijera",
          value: "tijera",
        },
      ],
    },
  ],

  async run({ client, interaction, args }) {
    const moves = { piedra: 0, papel: 1, tijera: 2 };
    const action = args.getString("move");

    function wrapIndex(i, i_max) {
      return ((i % i_max) + i_max) % i_max;
    }

    function determine_win(inputs) {
      let i = moves[inputs[0]],
        j = moves[inputs[1]];

      return wrapIndex(i + -j, 3);
    }

    function uppercase_first(string) {
      return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }

    if (!action)
      return interaction.reply("Eliga una entre piedra, papel o tijera.");

    const move = action as string;

    if (((!move as any) in moves) as any)
      return interaction.reply("Elige una opcion valida");

    let machineInput = Object.keys(moves)[Math.floor(Math.random() * 3)];

    let winner = determine_win([action, machineInput]);

    const embed = new EmbedBuilder()
      .setTitle("Piedra, papel o tijera.")
      .addFields([
        {
          name: `${interaction.user.username} eligió`,
          value: uppercase_first(action),
          inline: true,
        },
        {
          name: "Computadora eligió",
          value: uppercase_first(machineInput),
          inline: true,
        }
      ])
      .setColor(interaction.guild.members.cache.get(client.user.id)?.displayColor)
      .setFooter({
        text: interaction.member.displayName,
        iconURL: interaction.member.displayAvatarURL(),
      });

    if (winner == 0) {
      embed.setDescription("¡Vaya, hubo un empate!");
      return interaction.reply({ embeds: [embed] });
    } else if (winner == 1) {
      embed.setDescription("¡Has ganado, felicidades!");
      return interaction.reply({ embeds: [embed] });
    } else if (winner == 2) {
      embed.setDescription(
        "¡La computadora ha ganado, suerte para la proxima!"
      );
      return interaction.reply({ embeds: [embed] });
    }
  },
});
