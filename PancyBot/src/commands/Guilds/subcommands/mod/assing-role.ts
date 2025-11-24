import {Command} from "../../../../Structure/CommandSlash";
import {
    ActionRowBuilder,
    ApplicationCommandOptionType,
    EmbedBuilder,
    GuildMember,
    Role,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} from "discord.js";
import moment from "moment";

export default new Command({
    name: "assing-role",
    description: "Asigna o remueve roles a ti mismo, a un usuario o a todos los miembros con un rol específico.",
    category: "mod",
    options: [
        {
            name: "usuario",
            description: "El miembro al que se le asignarán los roles. Si no se especifica, serás tú.",
            type: ApplicationCommandOptionType.User,
            required: false,
        },
        {
            name: "rol",
            description: "Asigna los roles a todos los miembros que ya tengan este rol.",
            type: ApplicationCommandOptionType.Role,
            required: false,
        }
    ],
    userPermissions: ['ManageRoles'],
    botPermissions: ['ManageRoles'],

    run: async ({interaction, args}) => {
        const userTarget = args.getMember("usuario") as GuildMember;
        const roleTarget = args.getRole("rol") as Role;
        const executor = interaction.member as GuildMember;

        if (userTarget && roleTarget) {
            return interaction.reply({
                content: '❌ No puedes especificar un `usuario` y un `rol-objetivo` al mismo tiempo. Elige solo uno.',
                flags: ['Ephemeral']
            });
        }

        // --- LÓGICA PARA LA DESCRIPCIÓN Y EL TIEMPO ESTIMADO ---
        let targetDescription = "a ti mismo";
        let targetId = `self_${executor.id}`;
        let timeEstimation = ""; // Variable para el tiempo estimado

        if (userTarget) {
            targetDescription = `al usuario **${userTarget.user.tag}**`;
            targetId = `user_${userTarget.id}`;
        } else if (roleTarget) {
            const role = await interaction.guild.roles.fetch(roleTarget.id);
            const memberCount = role.members.size;
            // Usamos nuestra pausa proactiva (250ms) para el cálculo
            const estimatedMilliseconds = memberCount * 250;
            const duration = moment.duration(estimatedMilliseconds).format("h [horas], m [minutos] y s [segundos]");

            targetDescription = `a **${memberCount}** miembro(s) con el rol **${roleTarget.name}**`;
            targetId = `role_${roleTarget.id}`;
            timeEstimation = `\n\n⏱️ **Tiempo estimado:** Aproximadamente **${duration}**.`;
        }

        const botMember = await interaction.guild.members.fetch(interaction.client.user.id);
        const executorHighestRolePosition = executor.roles.highest.position;
        const botHighestRolePosition = botMember.roles.highest.position;

        const assignableRoles = interaction.guild.roles.cache.filter(role =>
            role.name !== '@everyone' && !role.managed &&
            role.position < botHighestRolePosition &&
            role.position < executorHighestRolePosition
        );

        if (assignableRoles.size === 0) {
            return interaction.reply({
                content: '🚫 No hay roles disponibles que puedas asignar según tu jerarquía.',
                flags: ['Ephemeral']
            });
        }

        const options = assignableRoles.map(role =>
            new StringSelectMenuOptionBuilder()
                .setLabel(role.name)
                .setValue(role.id)
                .setDescription(`ID: ${role.id}`)
        ).slice(0, 24);

        options.unshift(
            new StringSelectMenuOptionBuilder()
                .setLabel("✨ Asignar TODOS los roles de esta lista")
                .setValue("__ALL__")
                .setDescription("Añade todos los roles filtrados al objetivo.")
        );

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`role_assign_menu_${targetId}_${executor.id}`)
            .setPlaceholder('Selecciona uno o más roles para asignar/quitar...')
            .setMinValues(1)
            .setMaxValues(options.length)
            .addOptions(options);

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

        // --- EMBED FINAL CON LA ESTIMACIÓN DE TIEMPO ---
        const embed = new EmbedBuilder()
            .setTitle("Asignación de Roles")
            .setColor("Blurple")
            .setDescription(
                `Estás a punto de modificar los roles para **${targetDescription}**.\n\n` +
                `Selecciona los roles desde el menú. Si un miembro ya tiene un rol, se le quitará; si no lo tiene, se le añadirá.` +
                timeEstimation // Aquí se añade la estimación de tiempo
            )
            .setFooter({ text: `Tienes 2 minutos para hacer tu selección.` });

        await interaction.reply({
            embeds: [embed],
            components: [row],
            flags: ['Ephemeral']
        });
    }
})