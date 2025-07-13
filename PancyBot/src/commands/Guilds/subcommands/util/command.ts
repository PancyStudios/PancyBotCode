import {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  Colors,
  ComponentType
} from "discord.js";
import { Command } from "../../../../Structure/CommandSlash";

export default new Command({
    name: "commands",
    description: "Muestra la lista de comandos",
    category: "util",
    isDev: false,
    botPermissions: ["EmbedLinks"],

    async run({ interaction, client }) {
        const directories = [
            ...new Set(client.commands.map((cmd) => cmd.category)),
        ]

        const formatString = (str: string) =>  `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`

        const categories = directories.map((dir) => {
            const getCommands = client.commands
              .filter((cmd) => cmd.category === dir)
              .map((cmd) => {
                return {
                  name: cmd.name || "Comando no cargado",
                  description: cmd.description || "El comando no tiene descripcion",
                };
              });
            return {
              directory: formatString(dir),
              commands: getCommands,
            };
          });


    const embed = new EmbedBuilder().setDescription(
        "Seleciona una categoria"
      ).setColor("Yellow").setFooter({ text: interaction.user.tag, iconURL: interaction.user.avatarURL()}).setTimestamp();
      
      const adw = new ActionRowBuilder<StringSelectMenuBuilder>()

      const components = (state: boolean) => [
        adw.addComponents([
          new StringSelectMenuBuilder()
          .setCustomId("help-menu")
          .setPlaceholder("Porfavor selecciona una categoria")
          .setDisabled(state)
          .addOptions(
            categories.map((cmd) => {
              return {
                label: cmd.directory,
                value: cmd.directory.toLowerCase(),
                description: `Comandos de ${cmd.directory}`,
              };
            })
          )

        ])
      ];
      const initalinteraction = await interaction.reply({
        embeds: [embed],
        components: components(false),
      });
  
      const filter = (interaction) => interaction.user.id === interaction.author.id;
  
      const collector = initalinteraction.createMessageComponentCollector({
        filter: i => i.user.id === interaction.user.id,
        componentType: ComponentType.StringSelect,
      });
  
      collector.on("collect", (interaction) => {
        const [directory] = (interaction as any).values;
        const category = categories.find(
          (x) => x.directory.toLowerCase() === directory
        );
  
        const categoryEmbed = new EmbedBuilder()
          .setTitle(`comandos de ${directory}`)
          .setDescription("Lista de comandos")
          .addFields(
            category.commands.map((cmd) => {
              return {
                name: `\`${cmd.name}\``,
                value: cmd.description,
                inline: true,
              };
            })
          )
          .setColor(Colors.Blurple)
          .setThumbnail((interaction as any).user.avatarURL())
          .setFooter({
            text: (interaction as any).user.username,
            iconURL: (interaction as any).user.avatarURL()
          })
          .setTimestamp();
  
        (interaction as any).update({ embeds: [categoryEmbed] });
      });
  
      collector.on("end", () => {
        initalinteraction.edit({ components: components(true) });
      });
    }
})