import { Guild, antiRF } from '../../../Database/Schemas/BotDataBase'
import { version, privatebot } from '../../../../package.json'
import discord from 'discord.js'
import { ExtendedClient } from '../../../Structure/Client';
import { connect } from 'mongoose'

export async function install_commands(client: ExtendedClient, guild: discord.Guild) {
	try {
		let _guild = await Guild.findOne({ id: guild.id });
		if(!_guild) {
			let newGuild = new Guild({
				id: guild.id, // Server ID.
				ownerId: guild.ownerId, // The owner ID
				privateGuild: privatebot, // If the guild is private or not.

				protection: {
					antiraid: {
						enable: true,
						amount: 0
					},
					antibots: {
						enable: false,
						_type: 'all'
					},
					antitokens: {
						enable: false,
						usersEntrities: [],
						entritiesCount: 0
					},
					antijoins: {
						enable: false,
						rememberEntrities: []
					},
					markMalicious: {
						enable: true,
						_type: 'changeNickname',
						rememberEntrities: []
					},
					warnEntry: true,
					kickMalicious: {
						enable: false,
						rememberEntrities: []
					},
					ownSystem: {
						enable: false
					},
					verification: {
						enable: false,
					},
					cannotEnterTwice: {
						enable: false,
						users: []
					},
					purgeWebhooksAttacks: {
						enable: false,
						amount: 0,
						rememberOwners: 'Nadie'
					},
					intelligentSOS: {
						enable: false,
						cooldown: false
					},
					intelligentAntiflood: false,
					antiflood: true,
					bloqEntritiesByName: {
						enable: false,
						names: ['raider', 'doxer', 'hacker', 'infecter']
					},
					bloqNewCreatedUsers: {
						time: '1h'
					},
					raidmode: {
						enable: false,
						timeToDisable: '1d',
						password: 'Nothing',
						activedDate: 0
					}
				},

				moderation: {
					dataModeration: {
						events: {
							manyPings: true,
							capitalLetters: false,
							manyEmojis: false,
							manyWords: false,
							linkDetect: false,
							ghostping: true,
							nsfwFilter: false,
							iploggerFilter: true
						},
						snipes: {
							editeds: [],
							deleteds: []
						}
					},
					automoderator: { // Default moderation on the server.
						enable: false,
						actions: {
							warns: [ 3, 5 ],
							muteTime: [ 3600000, '10h' ],
							action: 'BAN',
							linksToIgnore: [ '.gif', '.png', '.jpg', '.txt', '.mp3' ],
							floodDetect: 5,
							manyEmojis: 4,
							manyPings: 4,
							manyWords: 250,
						},
						events: {
							badwordDetect: true,
							floodDetect: true,
							manyPings: true,
							capitalLetters: false,
							manyEmojis: false,
							manyWords: false,
							linkDetect: true,
							ghostping: true,
							nsfwFilter: false,
							iploggerFilter: true
						},
					},
				},

				configuration: {
					_version: version,
					prefix: 'pan!', // The SERVER_PREFIX.
					language: 'es',
					password: {
						enable: false,
						_password: '',
						usersWithAcces: [],
					},
					subData: {
						showDetailsInCmdsCommand: 'lessDetails', // The details of commands.
						pingMessage: 'allDetails',
						dontRepeatTheAutomoderatorAction: false
					},
				},
			});
			newGuild.save();
			console.log('Guild Instalada')
		} else {
			console.log('Guild ya instalada')
		}

		let user = (await antiRF.findOne({ user: guild.ownerId }) as any);
		if(!user) {
			user = new antiRF({
				user: guild.ownerId,
				isBloqued: false,
				isToken: false,
				achievements: {
					array: [ 'Humano.' ],
					data: {
						bugs: 0,
						serversCreatedTotally: 1,
						serversPartner: [],
						reports: 0,
						totalVotes: 0,
						initialMember: 0
					}
				},
				serversCreated: {
					servers: 0,
					date: 'hello?',
				},
				premium: {
					isActive: false,
					endAt: 0
				},
				servers: [ guild.id ],
				content: 'hello?',
				amount: 0
			});
			user.save();
			console.log('Usuario creado')
		}else{
			if(!user.servers.includes(guild.id)) {
				user.servers.push(guild.id);
				user.save();
				console.log('Usuario actualizado')
			}
		}
	} catch (error) {console.error(error)}
}
