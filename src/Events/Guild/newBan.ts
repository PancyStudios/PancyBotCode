import { AuditLogEvent, EmbedBuilder, TextChannel } from "discord.js";
import { Event } from "../../Structure/Events";
import { database } from "../..";
export default new Event('guildBanAdd', async (g) => {
    const requestLog = await database.guildDb.findOne({ id: g.guild.id})
    if(!requestLog.configuration.logs.includes(AuditLogEvent.MemberBanAdd)) return;
    if(!requestLog.configuration.logsChannel) return;
    g.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd}).then(async (log) => {
        const ban = log.entries.first()
        const channel = await g.guild.channels.fetch(requestLog.configuration.logsChannel) as TextChannel
        const Embed = new EmbedBuilder()
        .setTitle(`💫 | Baneo registrado`)
        .setFields(
            [
                {
                    name: '> Usuario Baneado',
                    value: `> ${ban.target.tag} (${ban.target.id})`
                },
                {
                    name: '> Razón',
                    value: `> ${ban.reason}`
                },
                {
                    name: '> Autor del baneo',
                    value: `> ${ban.executor.tag} (${ban.executor.id})`
                },
                {
                    name: '> Fecha',
                    value: `> <t:${Math.floor(ban.createdTimestamp / 1000)}>`
                }
            ]
        )
        .setFooter(
            {
                text: g.guild.name,
                iconURL: g.guild.iconURL() ?? null
            }
        )
        .setColor('#6488F4')

        channel?.send({ embeds: [Embed] })
    })
})