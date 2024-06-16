import { logs } from "../.."
import { Event } from "../../Structures/Events"
import axios from "axios"

export default new Event("ready", async (client) => { 
    setTimeout(() => {
        axios.post('https://califerbot.tk/api/info', {
        apikey: process.env.PasswordApi,
        info: {
            guilds: client.guilds.cache.size,
            users: client.users.cache.size,
            channels: client.channels.cache.size}
    }, {
        maxRedirects: 100
    }).then(x => {
        logs.log(x.status as undefined)
    }).finally(() => { logs.log('send')})
    }, 30 * 1000)
})