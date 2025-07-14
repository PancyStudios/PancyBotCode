import {Event} from "../../Structure/Events";
import {CommandInteractionOptionResolver, GuildMember, Interaction} from "discord.js";
import {ExtendedInteraction} from "../../Types/CommandSlash";
import {client} from "../../index";
import {forceDisableCommandsSlash} from '../../Database/Local/variables.json'; // Asumiendo que tienes esta lógica

export default new Event("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;

    // 1. Construir la clave del comando de forma unificada
    let commandKey: string;
    const commandName = interaction.commandName;
    const subcommandGroup = interaction.options.getSubcommandGroup(false);
    const subcommand = interaction.options.getSubcommand(false);

    if (subcommandGroup) {
        commandKey = `${commandName}.${subcommandGroup}.${subcommand}`;
    } else if (subcommand) {
        commandKey = `${commandName}.${subcommand}`;
    } else {
        commandKey = commandName;
    }

    // 2. Obtener el comando con una única búsqueda
    const command = client.commandHandler.commands.get(commandKey);

    // 3. Lógica unificada de ejecución y permisos
    if (command) {
        try {
            // --- Comprobaciones Previas ---
            if (forceDisableCommandsSlash.some(x => x === command.name)) {
                 return interaction.reply({ content: "Este comando está deshabilitado temporalmente.", ephemeral: true });
            }

            if (command.isDev) { // Asumiendo que tienes esta propiedad
                // Lógica para comandos de desarrollador
            }

            // Comprobación de permisos del usuario
            if (command.userPermissions) {
                const member = interaction.member as GuildMember;
                if (!member.permissions.has(command.userPermissions)) {
                    return interaction.reply({ content: `No tienes los permisos necesarios para ejecutar este comando. Requieres: \`${command.userPermissions.join(', ')}\``, ephemeral: true });
                }
            }

            // Comprobación de permisos del bot
            if (command.botPermissions) {
                const me = await interaction.guild.members.fetchMe();
                if (!me.permissions.has(command.botPermissions)) {
                    return interaction.reply({ content: `No tengo los permisos necesarios para ejecutar esta acción. Necesito: \`${command.botPermissions.join(', ')}\``, ephemeral: true });
                }
            }

            // --- Ejecución del Comando ---
            await command.run({
                args: interaction.options as CommandInteractionOptionResolver,
                client,
                interaction: interaction as ExtendedInteraction,
            });

        } catch (error) {
            console.error(error as Error, 'InteractionHandler');
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Ocurrió un error al ejecutar este comando.', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Ocurrió un error al ejecutar este comando.', ephemeral: true });
            }
        }
    } else {
        console.warn(`No se encontró la implementación para el comando: ${commandKey}`, 'InteractionHandler');
        await interaction.reply({ content: "Este comando parece no estar implementado correctamente o no se encontró.", ephemeral: true });
    }
});

