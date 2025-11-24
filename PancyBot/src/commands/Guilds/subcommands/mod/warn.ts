import {Command} from "../../../../Structure/CommandSlash";
import {database, errorHandler} from "../../../../index";
import {Warns} from "../../../../Database/Type/Warns";
import {EmbedBuilder, GuildMember} from "discord.js";
import {randomUUID} from "crypto";

export default new Command({
    name: "warn",
    description: "Advierte a un usuario",
    category: "mod",
    isDev: false,
    userPermissions: ['ManageGuild'],
    botPermissions: [],
    options: [
        {
            name: "user",
            description: "Usuario a advertir",
            type: 6,
            required: true
        },
        {
            name: "reason",
            description: "Razon de la advertencia",
            type: 3,
            required: false
        }
    ],

    async run({ client, interaction, args }) {
        const { guildId, guild } = interaction;
        const { warns, guilds } = database
        const userWarn = args.getMember("user") as GuildMember;
        const reasonArg = args.getString("reason");
        if (!userWarn) return interaction.reply({ content: "Debes mencionar a un usuario válido.", flags: ['Ephemeral'] });
        if (userWarn.id === interaction.user.id) return interaction.reply({ content: "No puedes advertirte a ti mismo.", flags: ['Ephemeral'] });
        if (userWarn.id === client.user.id) return interaction.reply({ content: "No puedes advertir al bot.", flags: ['Ephemeral'] });
        if (userWarn.id === guild.ownerId) return interaction.reply({ content: "No puedes advertir al dueño del servidor.", flags: ['Ephemeral'] });
        if (userWarn.roles.highest.position >= (interaction.member as GuildMember).roles.highest.position) {
            return interaction.reply({ content: "No puedes advertir a un usuario con un rol mayor o igual al tuyo.", flags: ['Ephemeral'] });
        }

        const reason = reasonArg && reasonArg.length > 0 ? reasonArg : "Razon no proporcionada";
        const EmbedInitProcess = new EmbedBuilder()
            .setTitle('⚠️ Advertencia en proceso...')
            .setDescription(`Advirtiendo a **${userWarn.user.tag}**...\n\nEspere un momento...`)
            .setColor('Yellow')
            .setFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();
        await interaction.reply({ embeds: [EmbedInitProcess] });

        const warnId = randomUUID();
        const shortId = warnId.split('-').slice(0,3).join('');

        try {
            const warnDb = await warns.get({ guildId: guildId, userId: userWarn.id });
            const newWarn: Warns = {
                reason: reason,
                moderator: interaction.user.id,
                id: shortId,
                timestamp: Date.now() / 1000,
            }
            if(!warnDb) {
                await warns.set({ guildId, userId: userWarn.id }, {
                    guildId,
                    userId: userWarn.id,
                    warns: [newWarn]
                })
            } else {
                const renoveWarns = [...warnDb.warns, newWarn];
                await warns.set({ guildId, userId: userWarn.id }, {
                    guildId,
                    userId: userWarn.id,
                    warns: renoveWarns
                })
            }
            const EmbedSuccess = new EmbedBuilder()
                .setTitle('✅ Usuario advertido con éxito')
                .setDescription(`El usuario **${userWarn.user.tag}** ha sido advertido correctamente.\n\n**Razón:** ${reason}\n**ID de Advertencia:** \`${shortId}\``)
                .setColor('Green')
                .setFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();
            await interaction.editReply({ embeds: [EmbedSuccess] });
        } catch (e) {
            const EmbedError = new EmbedBuilder()
                .setTitle('❌ Error al advertir al usuario')
                .setDescription(`No se pudo advertir al usuario **${userWarn.user.tag}** debido a un error inesperado.\n\nError: \`${e.message}\``)
                .setColor('Red')
                .setFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();
            const ErrorMessage = await interaction.editReply({ embeds: [EmbedError] });
            console.error(`Error al advertir al usuario ${userWarn.user.tag} en el servidor ${guild.name}:`, e);

            await errorHandler.report({ error: e.error, message: e.message });
            await ErrorMessage.react('⚙️')
        }

        const embedUser = new EmbedBuilder()
            .setTitle('⚠️ - Has recibido una advertencia')
            .setColor('Yellow')
            .setDescription(
                `⚒️ - **Servidor:** ${interaction.guild.name} (${interaction.guild.id})\n` +
                `🔨 - **Razón:** ${reason}\n\n` +
                `🕒 - **Fecha:** <t:${Math.floor(Date.now() / 1000)}:F>`
            )
            .setFooter({ text: '💫 - Developed by PancyStudios', iconURL: client.user.avatarURL() });

        await userWarn.send({ embeds: [embedUser] }).catch(async () => {
            const msg = await interaction.channel.send({ content: `⚠️ No se pudo enviar un mensaje directo a **${userWarn.user.tag}**.`})
            setTimeout(() => {
                msg.delete().catch(async () => {});
            }, 5000);
        });

        // Logging de la advertencia (Deshabilitado temporalmente)
        // const guildSettings = await guilds.get({ id: guildId });
        // const msg = await interaction.fetchReply()
        // if (guildSettings && guildSettings.moderation.logs.warns.enable && guildSettings.moderation.logs.warns.channel) {
        //     const logWarnDb = await warns.get({ guildId: guildId, userId: userWarn.id });
        //     const warnCount = logWarnDb ? logWarnDb.warns.length : 0;
        //     const channel = await client.channels.fetch(guildSettings.moderation.logs.warns.channel);
        //     if (!channel || !channel.isTextBased()) return console.warn(`El canal de logs de advertencias no es válido en el servidor ${guild.name}`, `GUILD: ${guild.id}`);
        //     const embedLog = new EmbedBuilder()
        //         .setAuthor({ name: `🌙 - Advertencia Añadida`, url: msg?.url ?? null })
        //         .setColor(warnCount >= 7 ? 'Red' :'Yellow')
        //         .setDescription(
        //             `⚠️ - **Usuario Advertido:** ${userWarn.user.tag} (${userWarn.id})\n` +
        //             `🔖 - **Recuento de advertencias:** ${warnCount} / 7 ${warnCount >= 7 ? '**Límite alcanzado/superado**' : ''}\n` +
        //             `🔨 - **Razón:** ${reason}\n\n` +
        //             `🛡️ - **Moderador:** ${interaction.user.tag} (${interaction.user.id})\n` +
        //             `⚒️ - **Acción realizada en:** ${channel.url}\n\n` +
        //             `🕒 - **Fecha:** <t:${Math.floor(Date.now() / 1000)}:F>`
        //         )
        //         .setThumbnail(interaction.guild.iconURL())
        //         .setFooter({ text: '💫 - Developed by PancyStudios', iconURL: client.user.avatarURL() });
        // }
    }
})