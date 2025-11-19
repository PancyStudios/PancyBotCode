import {Event} from "../../Structure/Events";
import {GuildMember, Interaction} from "discord.js";
import {client} from "../../index";
import {forceDisableCommandsSlash} from '../../Database/Local/variables.json';

export default new Event("interactionCreate", async (interaction: Interaction) => {
	if (!interaction.isAutocomplete()) return;

	//  Construir la clave del comando de forma unificada
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

	//Obtener el comando con una única búsqueda
	const command = client.commandHandler.commands.get(commandKey);

	//Lógica unificada de ejecución y permisos
	if (command) {
		try {
			if (forceDisableCommandsSlash.some(x => x === command.name)) return;

			if (command.userPermissions) {
				const member = interaction.member as GuildMember;
				if (!member.permissions.has(command.userPermissions)) {
					return;
				}
			}

			// Comprobación de permisos del bot
			if (command.botPermissions) {
				const me = await interaction.guild.members.fetchMe();
				if (!me.permissions.has(command.botPermissions)) {
					return;
				}
			}

			// --- Ejecución del Comando ---
			command.auto({
				client,
				interaction: interaction,
			});

		} catch (error) {
			console.error(error as Error, 'AutoComplete');
		}
	}
});

