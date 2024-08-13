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
        if(forceDisableCommandsSlash.some(x => x === interaction.commandName)) {
            return interaction.reply({ content: 'El comando se encuenta deshabilitado', ephemeral: true})
        }
        
        const status = utils.getStatusDB()
        if(status) {
            guildDb = await Guild.findOne({ id: interaction.guild.id }) as GuildDataFirst
            if(!guildDb.configuration) install_commands
            prefix = guildDb.configuration.prefix
        } else {
            prefix = "pan!"
        }


        const command = client.commands.get(interaction.commandName);
        if (!command){
            const devCommand = client.commandsDev.get(interaction.commandName);
            if(devCommand) {
                return
            } else {
                return interaction.reply({content: "Este comando no existe!", ephemeral: true});
            }
        }
            await interaction.deferReply();
            let userPermissions = command.userPermissions;
            let botPermissions = command.botPermissions;
            if(!interaction.guild.members.cache.get(interaction.user.id).permissions.has(userPermissions || [])) return interaction.followUp(`No tienes permisos para ejecutar este comando.\n Uno de estos permisos puede faltar: \`${typeof userPermissions === 'string' ? userPermissions : userPermissions.join(', ')}\``)
            if(!interaction.guild.members.cache.get(client.user.id).permissions.has(botPermissions || [])) return interaction.followUp(`No tengo permisos para ejecutar este comando.\n Uno de estos permisos puede faltar: \`${typeof botPermissions === 'string' ? botPermissions : botPermissions.join(', ')}\``)
        if(command.isDev) {
            if(interaction.user.id !== botStaff.ownerBot) return interaction.followUp("Solo el dueño del bot puede usar este commando"); console.log('NO')
            command.run({
                args: interaction.options as CommandInteractionOptionResolver,
                client,
                interaction: interaction as ExtendedInteraction,
                prefix,
                guilddb: guildDb,
            });
        } else if (command.database) {
            const DBStatus = utils.getStatusDB().isOnline
            if(!DBStatus) return interaction.followUp({ content: "Comando no disponible temporalmente \n\nMotivo: `DATABASE ERROR`", ephemeral: true })
        } else if (command.inVoiceChannel) {
            if(!(interaction.member as GuildMember).voice.channel) return interaction.followUp("Necesitas estas conectado a un canal de texto")
            command.run({
                args: interaction.options as CommandInteractionOptionResolver,
                client,
                interaction: interaction as ExtendedInteraction,
                prefix,
                guilddb: guildDb,
            });
        } else {
            command.run({
                args: interaction.options as CommandInteractionOptionResolver,
                client,
                interaction: interaction as ExtendedInteraction,
                prefix,
                guilddb: guildDb,
            });
        }
    } else if(interaction.isCommand()) {

    }
});
