import { Event } from '../../Structure/Events';
import { LogsModel } from '../../Database/Schemas/Logs';
import { Guild } from '../../Database/Schemas/BotDataBase';
import { mqttBot } from '../../Utils/mqttClient';
import { GuildMember } from 'discord.js';

export default new Event('guildMemberAdd', async (member: GuildMember) => {
    try {
        const guildConfig = await Guild.findOne({ id: member.guild.id });
        if (!guildConfig?.configuration?.logsChannel) return;

        const logContent = {
            userId: member.id,
            username: member.user.username,
            tag: member.user.tag,
            joinedAt: member.joinedAt
        };

        await LogsModel.create({
            guildId: member.guild.id,
            type: 'member_join',
            content: logContent,
            timestamp: new Date()
        });

        mqttBot.publish(`pancy/logs/${member.guild.id}/member_join`, logContent);

    } catch (error) {
        console.error("Error in guildMemberAdd log:", error);
    }
});
