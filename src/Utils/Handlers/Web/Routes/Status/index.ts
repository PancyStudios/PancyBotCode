import { Router } from "express";
import { logs, utils } from "../../../../../index";
import { client } from "../../../../../index";
import ms from "ms";

export var StatusRouter = Router()

StatusRouter.get("/bot", (req, res) => { 

    const Payload = req.body

    const login = Payload.apikey

    if(login === process.env.PasswordApi) {
        res.status(200).json({ 
            bot: {
                isOnline: utils.botIsOnline(),
                statsBot: { 
                    users: client.users.cache.size,
                    guilds: client.guilds.cache.size,
                    channels: client.channels.cache.size,
                    uptime: ms(client.uptime, { long: true })
                }
            },
            database: { 
                isOnline: utils.getStatusDB().isOnline || false,
                modules: {
                    Prefixes: true,
                    GuildBlacklist: true,
                    UserBlacklist: true,
                    PremiumUser: true,
                    PremiumGuild: true,
                    AntiRaid: false,
                    AntiChannels: false,
                    AntiRoles: false,
                    AntiBots: false,
                    AntiJoins: false,
                }
            }
         })
    }

    return res.status(404).json({
        error: "NotFound / NotAcces",
    })
})
if(logs) logs.log("[WEB] StatusRouter is loading")