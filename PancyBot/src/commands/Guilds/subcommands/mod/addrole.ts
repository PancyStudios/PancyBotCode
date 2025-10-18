import {Command} from "../../../../Structure/CommandSlash";
import {
    ActionRowBuilder,
    ApplicationCommandOptionType,
    EmbedBuilder,
    MessageActionRowComponentBuilder,
    RoleSelectMenuBuilder
} from "discord.js";

export default new Command({
    name: "addrole",
    description: "Añadir un rol o varios a un usuario",
    category: 'mod',
    options: [
        {
            name: "usuario",
            description: "Usuario al que se le añadirán los roles",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
    ],
    userPermissions: ['ManageRoles'],
    botPermissions: ['ManageRoles'],

    run: async ({interaction, args}) => {
        const user = args.getUser("usuario", true);
        const guild = interaction.guild!;
        const botMember = guild.members.me!;

        const RoleSelect = new RoleSelectMenuBuilder({
            customId: `addrole_${user.id}`,
            placeholder: 'Selecciona los roles a añadir',
            minValues: 1,
            maxValues: 25
        })

        const ActionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(RoleSelect);

        const Embed = new EmbedBuilder()
            .setTitle('Selecciona los roles a añadir')
            .setDescription(`Por favor, selecciona los roles que deseas añadir a ${user.tag} desde el menú desplegable de abajo.`)
            .setColor('Blue')
            .setFooter({text: `PancyBot`, iconURL: interaction.client.user.displayAvatarURL()})
            .setTimestamp();

        await interaction.reply({embeds: [Embed], components: [ActionRow], flags: ['Ephemeral'] });

    }
})