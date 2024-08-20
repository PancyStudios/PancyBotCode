import { GuildDataFirst } from '../Type/Security';
import { Poj } from '../Type/Poj';
import { Schema, model, SchemaTypes } from 'mongoose'
import { UserData } from '../Type/User';


const guildsSchema = new Schema({
    id: SchemaTypes.String,
    ownerId: SchemaTypes.String,
    protection: {
        antiraid: {
            enable: SchemaTypes.Boolean,
            amount: SchemaTypes.Number,
            saveBotsEntrities: {
                authorOfEntry: SchemaTypes.String,
                _bot: SchemaTypes.String
            }
        },
        antibots: {
            enable: SchemaTypes.Boolean,
            _type: SchemaTypes.String
        },
        antitokens: {
            enable: SchemaTypes.Boolean,
            usersEntrities: SchemaTypes.Array,
            entritiesCount: SchemaTypes.Number
        },
        antijoins: {
            enable: SchemaTypes.Boolean,
            rememberEntrities: SchemaTypes.Array
        },
        markMalicious: {
            enable: SchemaTypes.Boolean,
            _type: SchemaTypes.String,
            rememberEntrities: SchemaTypes.Array
        },
        warnEntry: SchemaTypes.Boolean,
        kickMalicious: {
            enable: SchemaTypes.Boolean,
            rememberEntrities: SchemaTypes.Array
        },
        ownSystem: {
            enable: SchemaTypes.Boolean,
            events: {
                messageCreate: SchemaTypes.Array,
                messageDelete: SchemaTypes.Array,
                messageUpdate: SchemaTypes.Array,
                channelCreate: SchemaTypes.Array,
                channelDelete: SchemaTypes.Array,
                channelUpdate: SchemaTypes.Array,
                roleCreate: SchemaTypes.Array,
                roleDelete: SchemaTypes.Array,
                roleUpdate: SchemaTypes.Array,
                emojiCreate: SchemaTypes.Array,
                emojiDelete: SchemaTypes.Array,
                emojiUpdate: SchemaTypes.Array,
                stickerCreate: SchemaTypes.Array,
                stickerDelete: SchemaTypes.Array,
                stickerUpdate: SchemaTypes.Array,
                guildMemberAdd: SchemaTypes.Array,
                guildMemberRemove: SchemaTypes.Array,
                guildMemberUpdate: SchemaTypes.Array,
                guildBanAdd: SchemaTypes.Array,
                guildBanRemove: SchemaTypes.Array,
                inviteCreate: SchemaTypes.Array,
                inviteDelete: SchemaTypes.Array,
                threadCreate: SchemaTypes.Array,
                threadDelete: SchemaTypes.Array
            }
        },
        verification: {
            enable: SchemaTypes.Boolean,
            _type: SchemaTypes.String,
            channel: SchemaTypes.String,
            role: SchemaTypes.String
        },
        cannotEnterTwice: {
            enable: SchemaTypes.Boolean,
            users: SchemaTypes.Array
        },
        purgeWebhooksAttacks: {
            enable: SchemaTypes.Boolean,
            amount: SchemaTypes.Number,
            rememberOwners: SchemaTypes.String
        },
        intelligentAntiflood: SchemaTypes.Boolean,
        antiflood: SchemaTypes.Boolean,
        bloqEntritiesByName: {
            enable: SchemaTypes.Boolean,
            names: SchemaTypes.Array
        },
        bloqNewCreatedUsers: {
            time: SchemaTypes.String
        },
        raidmode: {
            enable: SchemaTypes.Boolean,
            timeToDisable: SchemaTypes.String,
            password: SchemaTypes.String,
            activedDate: SchemaTypes.Number
        }
    },

    // MODERACIÓN

    // CONFIGURACIÓN
    configuration: {
        _version: SchemaTypes.String,
        prefix: SchemaTypes.String,
        whitelist: SchemaTypes.Array,
        logs: SchemaTypes.Array,
        logsChannel: SchemaTypes.String,
        language: SchemaTypes.String,
        ignoreChannels: SchemaTypes.Array,
        password: {
            enable: SchemaTypes.Boolean,
            _password: SchemaTypes.String,
            usersWithAcces: SchemaTypes.Array,
        },
        subData: {
            showDetailsInCmdsCommand: SchemaTypes.String,
            pingMessage: SchemaTypes.String,
            dontRepeatTheAutomoderatorAction: SchemaTypes.Boolean
        }
    },
});


const AntiRFSchema = new Schema({
    user: SchemaTypes.String,
    content: SchemaTypes.String,
    amount: SchemaTypes.Number,
    isBloqued: SchemaTypes.Boolean,
    isToken: SchemaTypes.Boolean,
    achievements: {
        array: SchemaTypes.Array,
        data: {
            bugs: SchemaTypes.Number,
            serversCreatedTotally: SchemaTypes.Number,
            serversPartner: SchemaTypes.Array,
            reports: SchemaTypes.Number,
            totalVotes: SchemaTypes.Number,
            initialMember: SchemaTypes.Boolean
        }
    },
    serversCreated: {
        servers: SchemaTypes.Number,
        date: SchemaTypes.String,
    },
    premium: {
        isActive: SchemaTypes.Boolean,
        endAt: SchemaTypes.Number
    },
    servers: SchemaTypes.Array
})

const SchemaPoj = new Schema({
    guildId: { type: SchemaTypes.String, required: true },
    channels: { type: SchemaTypes.Array },
})

export const PojDB = model<Poj>('pojDB', SchemaPoj)
export const antiRF = model<UserData>('AntiRF', AntiRFSchema)
export const Guild = model<GuildDataFirst>('Guild', guildsSchema);
