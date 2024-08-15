import { CommandInteractionOptionResolver, GuildMember } from "discord.js";
import { client, utils } from '../..';
import { Event } from "../../Structure/Events";
import { ExtendedInteraction } from "../../Types/CommandSlash";
import { botStaff, forceDisableCommandsSlash } from '../../Database/Local/variables.json'
import { GuildDataFirst } from "../../Database/Type/Security";
import { Guild } from "../../Database/BotDataBase";
import { install_commands } from "../../Utils/Handlers/DatabaseHandler";
let prefix: string
let guildDb: GuildDataFirst


export default new Event("interactionCreate", async (interaction) => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        const subCommandName = interaction.options.getSubcommand(false);
        const subCommandGroupName = interaction.options.getSubcommandGroup(false);
        const subCommand = client.commands.get(`${interaction.commandName}.${subCommandName}`);
        const subCommandGroup = client.commands.get(`${interaction.commandName}.${subCommandGroupName}.${subCommandName}`);

        if(command) {
            if(forceDisableCommandsSlash.some(x => x === command.name)) return interaction.reply({ content: "Este comando esta deshabilitado temporalmente", ephemeral: true });
            if(command.isDev) return;

            let permissions = command.userPermissions;
            let botPermissions = command.botPermissions;
            if(permissions) {
                if(!(interaction.member as GuildMember).permissions.has(permissions)) return interaction.reply({ content: `No tienes permisos para ejecutar este comando.\n Uno de estos permisos puede faltar: \`${typeof permissions === 'string' ? permissions : permissions.join(', ')}\``, ephemeral: true });
            }
            if(botPermissions) {
                const me = await interaction.guild.members.fetchMe();
                if(!me?.permissions.has(botPermissions)) return interaction.reply({ content: `No tengo permisos para ejecutar este comando.\n Uno de estos permisos puede faltar: \`${typeof botPermissions === 'string' ? botPermissions : botPermissions.join(', ')}\``, ephemeral: true });
            }

            await command.run({
                args: interaction.options as CommandInteractionOptionResolver,
                client,
                interaction: interaction as ExtendedInteraction,
                prefix,
                guilddb: guildDb,
            })
        } else if(subCommand) {
            if(forceDisableCommandsSlash.some(x => x === subCommand.name)) return interaction.reply({ content: "Este comando esta deshabilitado temporalmente", ephemeral: true });
            if(subCommand.isDev) return;

            let permissions = subCommand.userPermissions;
            let botPermissions = subCommand.botPermissions;
            if(permissions) {
                if(!(interaction.member as GuildMember).permissions.has(permissions)) return interaction.reply({ content: `No tienes permisos para ejecutar este comando.\n Uno de estos permisos puede faltar: \`${typeof permissions === 'string' ? permissions : permissions.join(', ')}\``, ephemeral: true });
            }
            if(botPermissions) {
                const me = await interaction.guild.members.fetchMe();
                if(!me?.permissions.has(botPermissions)) return interaction.reply({ content: `No tengo permisos para ejecutar este comando.\n Uno de estos permisos puede faltar: \`${typeof botPermissions === 'string' ? botPermissions : botPermissions.join(', ')}\``, ephemeral: true });
            }


            await subCommand.run({
                args: interaction.options as CommandInteractionOptionResolver,
                client,
                interaction: interaction as ExtendedInteraction,
                prefix,
                guilddb: guildDb,
            })
        } else if(subCommandGroup) {
            if(forceDisableCommandsSlash.some(x => x === subCommandGroup.name)) return interaction.reply({ content: "Este comando esta deshabilitado temporalmente", ephemeral: true });
            if(subCommandGroup.isDev) return;

            let permissions = subCommandGroup.userPermissions;
            let botPermissions = subCommandGroup.botPermissions;
            if(permissions) {
                if(!(interaction.member as GuildMember).permissions.has(permissions)) return interaction.reply({ content: `No tienes permisos para ejecutar este comando.\n Uno de estos permisos puede faltar: \`${typeof permissions === 'string' ? permissions : permissions.join(', ')}\``, ephemeral: true });
            }
            if(botPermissions) {
                const me = await interaction.guild.members.fetchMe();
                if(!me?.permissions.has(botPermissions)) return interaction.reply({ content: `No tengo permisos para ejecutar este comando.\n Uno de estos permisos puede faltar: \`${typeof botPermissions === 'string' ? botPermissions : botPermissions.join(', ')}\``, ephemeral: true });
            }


            await subCommandGroup.run({
                args: interaction.options as CommandInteractionOptionResolver,
                client,
                interaction: interaction as ExtendedInteraction,
                prefix,
                guilddb: guildDb,
            })
        }
    } else if(interaction.isCommand()) {

    }
});
