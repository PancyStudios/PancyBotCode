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
        const manageableRoles = guild.roles.cache
            .filter(r => r.id !== guild.id && !r.managed && botMember.roles.highest.position > r.position && interaction.member.roles.highest.position > r.position)
            .sort((a, b) => b.position - a.position)
            .map(r => ({ label: r.name.slice(0, 100), value: r.id, description: `Pos ${r.position}` }))
            .slice(0, 25);

        if (manageableRoles.length === 0) {
            return interaction.reply({ content: 'No hay roles que pueda gestionar.', flags: ['Ephemeral'] });
        }

        const RoleSelect = new RoleSelectMenuBuilder({
            customId: `addrole_${user.id}`,
            placeholder: 'Selecciona los roles a añadir',
            minValues: 1,
        })
            .setMaxValues(Math.min(25, manageableRoles.length))

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