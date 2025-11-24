import { MqttCommunicator } from '../../Utils/Handlers/MMQT'
import { Event } from "../../Structure/Events";
import { client, database } from "../../index";
import { version } from '../../../../package.json'

import { mqttBot } from '../../Utils/mqttClient';

export default new Event('ready', async (_) => {
    mqttBot.on('get-stats', async () => {
        return JSON.stringify({
            guilds: client.guilds.cache.size,
            users: client.users.cache.size,
            channels: client.channels.cache.size,
            uptime: client.uptime,
            commands: client.commands.size,
            nodeVersion: process.version,
            botVersion: version,
            ping: `${client.ws.ping}ms`,
            memory: process.memoryUsage().heapUsed / 1024 / 1024,
            cpu: process.cpuUsage().user / 1024 / 1024,
            platform: process.platform,
            arch: process.arch,
            release: process.release,
            database: database.getStatusDB()
        })
    })

    mqttBot.on('get-bot-guild-ids', async () => {
        return client.guilds.cache.map(guild => guild.id);
    });

    mqttBot.on('get-guild-info', async (payload) => {
        const { guildId } = payload;
        const guild = client.guilds.cache.get(guildId);

        if (!guild) return null;

        return {
            id: guild.id,
            name: guild.name,
            icon: guild.icon,
            ownerId: guild.ownerId,
            memberCount: guild.memberCount,
            description: guild.description,
            premiumTier: guild.premiumTier,
            banner: guild.banner,
            channels: guild.channels.cache.map(c => ({

            })),
            roles: guild.roles.cache.map(c => ({

            })),
        };
    });


    // --- MANEJO DE SEÑALES DE APAGADO ---
    const shutdown = async (signal: string) => {
        console.warn(`Señal de apagado recibida: ${signal}. Cerrando conexiones...`, 'SYS');

        await mqttBot.destroy();

        await database.disconnect();

        await client.destroy();

        console.system('Todas las conexiones cerradas. El proceso terminará.', 'SYS');
        process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT')); // Captura Ctrl+C
    process.on('SIGTERM', () => shutdown('SIGTERM')); // Captura la señal de "stop" de Pterodactyl/Docker

})