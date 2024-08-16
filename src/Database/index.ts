import { connect, Model, Document, Types, connection } from 'mongoose';
import { premiumGuildModel, premiumModel } from './Schemas/premium';
import { warns, WarnsInterface } from './Schemas/Warns';
import { Premium, PremiumGuild } from './Type/Premium';
import { TempbanModel } from './Schemas/Tempbans';
import { GuildDataFirst } from './Type/Security';
import { TempbanOptions } from './Type/Tempan';
import { Guild } from './Schemas/BotDataBase';

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

    constructor() {
        this.connect()
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
}