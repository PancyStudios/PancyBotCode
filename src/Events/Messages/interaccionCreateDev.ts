import { CommandInteractionOptionResolver } from "discord.js";
import { client, logs } from '../..';
import { Event } from "../../Structure/Events";
import { ExtendedInteraction } from "../../Types/CommandSlash";
import { exclusiveUsers } from '../../Database/Local/variables.json'
import { GuildDataFirst } from "../../Database/Type/Security";
let prefix: string
let guildDb: GuildDataFirst


export default new Event("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
        if(!interaction.isRepliable) return logs.error('No se puede responder a esta interaccion')

        const command = client.commandsDev.get(interaction.commandName);
            let userPermissions = command.userPermissions;
            let botPermissions = command.botPermissions;
            if(!interaction.guild.members.cache.get(interaction.user.id).permissions.has(userPermissions || [])) return interaction.followUp(`No tienes permisos para ejecutar este comando.\n Uno de estos permisos puede faltar: \`${typeof userPermissions === 'string' ? userPermissions : userPermissions.join(', ')}\``)
            if(!interaction.guild.members.cache.get(client.user.id).permissions.has(botPermissions || [])) return interaction.followUp(`No tengo permisos para ejecutar este comando.\n Uno de estos permisos puede faltar: \`${typeof botPermissions === 'string' ? botPermissions : botPermissions.join(', ')}\``)
        if(command.isDev) {
            if(exclusiveUsers.some(x => x.id === interaction.user.id && x.devPermissions === true)) {
                return await command.run({
                    args: interaction.options as CommandInteractionOptionResolver,
                    client,
                    interaction: interaction as ExtendedInteraction,
                    prefix,
                    guilddb: guildDb,
                });
            } else return interaction.followUp("Solo los desarrolladores pueden usar este comando ")
        }

        logs.error('Comando de desarollador con fallo en la configuracion: isDev: true es necesario en caso contrario este comando se cargo de manera incorrecta en esta coleccion')
        logs.info(`Comando: ${command.name} - ${command.description}`)
        return interaction.reply({content: "Esto no deberia ocurrir, revisar si fue construido correctamente el comando", ephemeral: true});
    }
});
