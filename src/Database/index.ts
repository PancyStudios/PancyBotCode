import { connect, Model, Document, Types, connection } from 'mongoose';
import { premiumGuildModel, premiumModel } from './Schemas/premium';
import { warns, WarnsInterface } from './Schemas/Warns';
import { Premium, PremiumGuild } from './Type/Premium';
import { TempbanModel } from './Schemas/Tempbans';
import { GuildDataFirst } from './Type/Security';
import { TempbanOptions } from './Type/Tempan';
import { Guild } from './Schemas/BotDataBase';
import { Collection } from 'discord.js';
import { EmbedDb } from './Type/Embeds';
import { Embeds, EmbedsSchema } from './Schemas/Embeds';
export class Database {
    warns: Model<WarnsInterface, {}, {}, {}, Document<unknown, {}, WarnsInterface> & WarnsInterface & {
        _id: Types.ObjectId;
    }, any> = warns;
    guildDb: Model<GuildDataFirst, {}, {}, {}, Document<unknown, {}, GuildDataFirst> & GuildDataFirst & {
        _id: Types.ObjectId;
    }, any> = Guild;
    tempban: Model<TempbanOptions, {}, {}, {}, Document<unknown, {}, TempbanOptions> & TempbanOptions & {
        _id: Types.ObjectId;
    }, any> = TempbanModel;
    premiumUser: Model<Premium, {}, {}, {}, Document<unknown, {}, Premium> & Premium & {
        _id: Types.ObjectId;
    }, any> = premiumModel;
    premiumGuild: Model<PremiumGuild, {}, {}, {}, Document<unknown, {}, PremiumGuild> & PremiumGuild & {
        _id: Types.ObjectId;
    }, any> = premiumGuildModel;
    embeds: Model<EmbedDb, {}, {}, {}, Document<unknown, {}, EmbedDb> & EmbedDb & {
        _id: Types.ObjectId;
    }, any> = Embeds;
    caches: {
        warns: Collection<string, WarnsInterface>;
        guilds: Collection<string, GuildDataFirst>;
        tempban: Collection<string, TempbanOptions>;
        premium: Collection<string, Premium>;
        premiumGuilds: Collection<string, PremiumGuild>;
    } = {
        guilds: new Collection(),
        warns: new Collection(),
        tempban: new Collection(),
        premium: new Collection(),
        premiumGuilds: new Collection(),
    }

    constructor() {
        this.connect()
        setInterval(() => {
            this.reconnect()
        }, 1000 * 60 * 5)
    }

    private async connect() {
        try {   
            console.log('Conectando a la base de datos', 'DB')
            await connect(process.env.mongodbUrl, { 
                user: process.env.mongodbUser,
                pass: process.env.mongodbPass,
                tls: false,
                dbName: 'PancyBot',
            })
            console.log(`Conectado a la base de datos`, 'DB')
        } catch (err) {
            console.warn('Se a detectado un error al conectar la base de datos', 'DB')
            console.error(err)
        }
    }

    public async ping() {
        const start = Date.now()
        await connection.db.admin().ping()
        return Date.now() - start
    }

    public getStatusDB () {
        var StringStatus: string
        var isOnline = false
        switch (connection.readyState) {
            case 0:
                StringStatus = '🔴 | Desconectado'
            break;
            case 1:
                StringStatus = '🟢 | En linea'
                isOnline = true
            break;
            case 2:
                StringStatus = '🟡 | Conectando'
            break;
            case 3:
                StringStatus = '🟠 | Desconectando'
            break;
            default:
                StringStatus = '🟣 | Unknown'
            break;
        }
        return {
            StringStatus,
            isOnline
        }
    }

    private async reconnect() {
        const status = this.getStatusDB()
        if(status.isOnline) {
            return
        } else {
            console.debug('Reconectando a la base de datos', 'MongoDB')
            await this.connect()
        }
    }
}