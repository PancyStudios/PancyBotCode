import {Command} from "../../../../Structure/CommandSlash";
import {ApplicationCommandOptionType, ChannelType, EmbedBuilder} from "discord.js";
import {errorHandler} from "../../../../index";
import {version} from "../../../../../../package.json";

export default new Command({
    name: 'nuke',
    description: 'Elimina todo el contenido de un canal',
    category: 'mod',
    options: [
        {
            name: 'channel',
            description: 'Canal a eliminar el contenido',
            type: ApplicationCommandOptionType.Channel,
            channel_types: [ChannelType.GuildText, ChannelType.GuildAnnouncement],
            required: false,
        }
    ],

    run: async ({ client, interaction, args }) => {
        const channelBase = args.getChannel('channel', false, [ChannelType.GuildText, ChannelType.GuildAnnouncement]);
        try {
            if(!channelBase) {
                const channel = interaction.channel;
                if (!channel || (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildAnnouncement)) {
                    const EmbedInvalidChannel = new EmbedBuilder()
                        .setTitle('Canal inválido')
                        .setDescription('El tipo de canal donde se esta ejecutando el comando no es un tipo valido, solo se puede ejecutar este comando en canales tipo ´GuildText´ & ´GuildAnnouncement´\n\nEjecuta este comando en un canal diferente valido o especifica el argumento ´channel´.')
                        .setColor('Red')
                        .setFooter({text: `PancyBot ${version}`, iconURL: client.user.displayAvatarURL()})
                    return interaction.reply({embeds: [EmbedInvalidChannel], flags: ['Ephemeral']});
                }
            }
            const permissions = channelBase.permissionsFor(interaction.user.id) || interaction.channel.permissionsFor(interaction.user.id);
            if (!permissions || (!permissions.has('ManageChannels') && !permissions.has('ManageMessages'))) {
                const EmbedNoPerms = new EmbedBuilder()
                    .setTitle('No tienes permisos suficientes')
                    .setDescription('Necesitas tener permisos de `Gestionar Canales` & `Gestionar Mensajes` para usar este comando en el canal seleccionado.')
                    .setColor('Red')
                    .setFooter({text: `PancyBot ${version}`, iconURL: client.user.displayAvatarURL()})
                return interaction.reply({embeds: [EmbedNoPerms], flags: ['Ephemeral']});
            }
            if (!channelBase.viewable) {
                const EmbedNoView = new EmbedBuilder()
                    .setTitle('No puedo ver el canal')
                    .setDescription('No tengo permisos para ver el canal seleccionado. Por favor, asegúrate de que tengo permisos de `Ver Canal` para poder ejecutar este comando.')
                    .setColor('Orange')
                    .setFooter({text: `PancyBot ${version}`, iconURL: client.user.displayAvatarURL()})
                return interaction.reply({embeds: [EmbedNoView], flags: ['Ephemeral']});
            }
            if (!channelBase.manageable) {
                const EmbedNoManage = new EmbedBuilder()
                    .setTitle('No puedo gestionar el canal')
                    .setDescription('No tengo permisos para gestionar el canal seleccionado. Por favor, asegúrate de que tengo permisos de `Gestionar Canales` para poder ejecutar este comando.')
                    .setColor('Orange')
                    .setFooter({text: `PancyBot ${version}`, iconURL: client.user.displayAvatarURL()})
                return interaction.reply({embeds: [EmbedNoManage], flags: ['Ephemeral']});
            }
            if (channelBase.parent && !channelBase.parent?.manageable) {
                const EmbedNoManageParent = new EmbedBuilder()
                    .setTitle('No puedo gestionar la categoría del canal')
                    .setDescription('No tengo permisos para gestionar la categoría del canal seleccionado. Por favor, asegúrate de que tengo permisos de `Gestionar Canales` en la categoría para poder ejecutar este comando.')
                    .setColor('Orange')
                    .setFooter({text: `PancyBot ${version}`, iconURL: client.user.displayAvatarURL()})
                return interaction.reply({embeds: [EmbedNoManageParent], flags: ['Ephemeral']});
            }

            const clonedChannel = await channelBase.clone({reason: `Comando Nuke usado por ${interaction.user.tag} (${interaction.user.id})`});
            await channelBase.delete(`Comando Nuke usado por ${interaction.user.tag} (${interaction.user.id})`);
            await clonedChannel.edit({position: channelBase.position});
            const EmbedNukeSuccess = new EmbedBuilder()
                .setTitle('Canal Eliminado con Éxito')
                .setDescription(`El canal ${channelBase} ha sido eliminado y recreado con éxito. Todo su contenido ha sido eliminado.`)
                .setColor('Green')
                .setFooter({text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})

            await interaction.reply({embeds: [EmbedNukeSuccess]});
        } catch (err) {
            const EmbedErrorPublic = new EmbedBuilder()
                .setTitle(`Error: ${err.error}`)
                .setDescription(`Se ha producido un error al intentar eliminar el contenido del canal.\nPor favor, inténtalo de nuevo más tarde o contacta con el soporte si el problema persiste.\n\nSe ha reportado automaticamente este error al equipo de desarrollo para su revisión.`)
                .setColor('Red')
                .setFooter({ text: `PancyBot ${version}`, iconURL: client.user.displayAvatarURL() })
            await interaction.reply({ embeds: [EmbedErrorPublic], flags: ['Ephemeral']});
            await errorHandler.report({ message: err.message, error: err.error}).catch(() => null)
        }
    }
})