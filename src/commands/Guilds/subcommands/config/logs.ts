import { Command } from "../../../Structure/CommandMsg";

export default new Command({
    name: "logs",
    description: "Establece el canal de Logs",
    use: "{enable <channelMention>, disable}",
    category: "config",
    userPermissions: ["ManageGuild"],
    botPermissions: ["ViewChannel"],
    isDev: false,

    async run ({ client, message, args }) {
        message.reply({content: 'Comando en re escritura' })
    }
})