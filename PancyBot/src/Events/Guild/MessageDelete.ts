import { Event } from '../../Structure/Events';
import { LogsModel } from '../../Database/Schemas/Logs';
import { Guild } from '../../Database/Schemas/BotDataBase';
import { mqttBot } from '../../Utils/mqttClient';
import { Message, PartialMessage } from 'discord.js';

export default new Event('messageDelete', async (message: Message | PartialMessage) => {
    if (!message.guild || message.author?.bot) return;

    try {
        // 1. Check if logs are enabled for this guild
        const guildConfig = await Guild.findOne({ id: message.guild.id });

        // Assuming 'logs' in configuration is an array of enabled log types or just a boolean check
        // For now, we'll assume if logsChannel is set, logs are enabled.
        // Or check if 'messageDelete' is in the logs array if it exists.

        if (!guildConfig?.configuration?.logsChannel) return;

        // 2. Create Log Entry
        const logContent = {
            authorId: message.author?.id,
            authorTag: message.author?.tag,
            channelId: message.channel.id,
            // @ts-ignore
            channelName: message.channel.name,
            content: message.content,
            attachments: message.attachments?.map(a => a.url) || []
        };

        const logEntry = await LogsModel.create({
            guildId: message.guild.id,
            type: 'message_delete',
            content: logContent,
            timestamp: new Date()
        });

        // 3. Publish to MQTT for Realtime Dashboard
        mqttBot.publish(`pancy/logs/${message.guild.id}/message_delete`, logContent);

    } catch (error) {
        console.error("Error in messageDelete log:", error);
    }
});
