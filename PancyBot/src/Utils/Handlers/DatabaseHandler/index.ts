import {Guild as DiscordGuild} from 'discord.js';
import {version} from '../../../../../package.json';
import {ExtendedClient} from '../../../Structure/Client';
import {database} from '../../../index';

export async function install_commands(client: ExtendedClient, guild: DiscordGuild) {
    try {
        // --- Gestión de la Guild ---
        let guildData = await database.guilds.get({ id: guild.id });

        if (!guildData) {
            console.log(`Instalando configuración para el nuevo servidor: ${guild.name}`);
            // Creamos la configuración para la nueva guild usando .set()
            await database.guilds.set({ id: guild.id }, {
                id: guild.id,
                ownerId: guild.ownerId,
                protection: {
                    antiraid: { enable: true, amount: 0, saveBotsEntrities: { authorOfEntry: '', _bot: '' }},
                    antibots: { enable: false, _type: 'all' },
                    antitokens: { enable: false, usersEntrities: [], entritiesCount: 0 },
                    antijoins: { enable: false, rememberEntrities: [] },
                    markMalicious: { enable: true, _type: 'changeNickname', rememberEntrities: [] },
                    warnEntry: true,
                    kickMalicious: { enable: false, rememberEntrities: [] },
                    ownSystem: {
                        enable: false,
                        events: {
                            messageCreate: [],
                            messageDelete: [],
                            messageUpdate: [],
                            channelCreate: [],
                            channelDelete: [],
                            channelUpdate: [],
                            roleCreate: [],
                            roleDelete: [],
                            roleUpdate: [],
                            emojiCreate: [],
                            emojiDelete: [],
                            emojiUpdate: [],
                            stickerCreate: [],
                            stickerDelete: [],
                            stickerUpdate: [],
                            guildMemberAdd: [],
                            guildMemberRemove: [],
                            guildMemberUpdate: [],
                            guildBanAdd: [],
                            guildBanRemove: [],
                            inviteCreate: [],
                            inviteDelete: [],
                            threadCreate: [],
                            threadDelete: [],
                        }
                    },
                    verification: { enable: false, _type: '', channel: '', role: '' },
                    cannotEnterTwice: { enable: false, users: [] },
                    purgeWebhooksAttacks: { enable: false, amount: 0, rememberOwners: 'Nadie' },
                    intelligentSOS: { enable: false, cooldown: false },
                    intelligentAntiflood: false,
                    antiflood: true,
                    bloqEntritiesByName: { enable: false, names: ['raider', 'doxer', 'hacker', 'infecter'] },
                    bloqNewCreatedUsers: { time: '1h' },
                    raidmode: { enable: false, timeToDisable: '1d', password: 'Nothing', activedDate: 0 }
                },
                moderation: {
                    logs: {
                        warns: { enable: false, channel: ''},
                        mutes: { enable: false, channel: ''},
                        kicks: { enable: false, channel: ''},
                        bans: { enable: false, channel: ''},
                    },
                    dataModeration: {
                        muterole: '',
                        forceReasons: [],
                        timers: [],
                        badwords: [],
                        events: {
                            manyPings: false,
                            capitalLetters: false,
                            manyEmojis: false,
                            manyWords: false,
                            linkDetect: false,
                            ghostping: false,
                            nsfwFilter: false,
                            iploggerFilter: false,
                        },
                        snipes: { editeds: [], deleteds: [] }
                    },
                    automoderator: {
                        enable: false,
                        actions: {
                            warns: [],
                            muteTime: [],
                            action: '',
                            linksToIgnore: [],
                            floodDetect: 0,
                            manyEmojis: 0,
                            manyPings: 0,
                            manyWords: 0,
                        },
                        events: {
                            badwordDetect: false,
                            floodDetect: false,
                            manyPings: false,
                            capitalLetters: false,
                            manyEmojis: false,
                            manyWords: false,
                            linkDetect: false,
                            ghostping: false,
                            nsfwFilter: false,
                            iploggerFilter: false,
                        }
                    }
                },
                configuration: {
                    _version: version,
                    prefix: 'pan!',
                    language: 'es',
                    whitelist: [],
                    logs: [],
                    logsChannel: '',
                    ignoreChannels: [],
                    password: { enable: false, _password: '', usersWithAcces: [] },
                    subData: { showDetailsInCmdsCommand: 'lessDetails', pingMessage: 'allDetails', dontRepeatTheAutomoderatorAction: false },
                },
            });
            console.log('Guild Instalada y en caché/cola.');
        } else {
            console.log(`La guild ${guild.name} ya estaba registrada.`);
        }

        // --- Gestión del Usuario (AntiRF) ---
        let userData = await database.users.get({ user: guild.ownerId });

        if (!userData) {
            console.log(`Creando perfil para el owner: ${guild.ownerId}`);
            // Creamos el perfil del usuario si no existe
            await database.users.set({ user: guild.ownerId }, {
                user: guild.ownerId,
                isBloqued: false,
                isToken: false,
                achievements: { array: ['Humano.'], data: { bugs: 0, serversCreatedTotally: 1, serversPartner: [], reports: 0, totalVotes: 0, initialMember: 0 }},
                serversCreated: { servers: 0, date: 'hello?' },
                premium: { isActive: false, endAt: 0 },
                servers: [guild.id],
                content: 'hello?',
                amount: 0
            });
            console.log(`Perfil de usuario creado para el owner ${guild.ownerId}`);
        } else {
            // Si el usuario ya existe, solo actualizamos su lista de servidores si es necesario
            if (!userData.servers.includes(guild.id)) {
                const updatedServers = [...userData.servers, guild.id];
                await database.users.set({ id: guild.ownerId }, { servers: updatedServers });
                console.log(`Usuario ${guild.ownerId} actualizado con la nueva guild.`);
            }
        }
    } catch (error) {
        console.error(`Error fatal al instalar la guild ${guild.name}:`, 'DB-Handler');
        console.error(error as Error);
    }
}