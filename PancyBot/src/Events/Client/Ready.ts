import {Event} from '../../Structure/Events';
import {version} from '../../../../package.json'
import {client} from '../../index';
import {ActivityType} from 'discord.js'

export default new Event('ready', async (_) => {
    console.log('Bot encendido', 'Client')

    const activities = [
        `PancyBot | ${version}`,
        `pan! | ${version}`,
        `PancyBot Studios | ${version}`
    ]

    const random = activities[Math.floor(Math.random() * activities.length)]

    setInterval(() => {
        client.user.setPresence({
            activities: [{
                name: random,
                type: ActivityType.Playing,
            }],
            afk: false,
        })
    }, 1000 * 15)
})