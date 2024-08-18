import { Router } from "express";
import { client, database } from "../../../../..";
import { version } from "../../../../../../package.json";
export var ApiRouter = Router();

ApiRouter.get("/bot/stats", (req, res) => {
    if(client.isReady()) {
        res.status(201).json({
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
    } else {
        res.status(503).json({ error: 'Bot is not ready' })
    }
})
ApiRouter.all("/*", (_, res) => {
    res.status(503).json({ error: 'En desarrollo' })
})

console.debug('ApiRouter is loading', 'WEB')