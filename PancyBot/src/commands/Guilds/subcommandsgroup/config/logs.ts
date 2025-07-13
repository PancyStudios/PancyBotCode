import { Command } from "../../../../Structure/CommandSlash";

export default new Command({
    name: "logs",
    description: "Establece el canal de Logs",
    category: "config",
    userPermissions: ["ManageGuild"],
    botPermissions: ["ViewChannel"],
    isDev: false,

    async run ({ interaction }) {
        
    }
})