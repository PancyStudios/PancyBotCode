import { TextChannel } from "discord.js";
import { Command } from "../../../Structure/CommandMsg";

export default new Command({
    name: "setprefix",
    description: "Set the prefix of the command",
    category: "config",
    use: '<NewPrefix>',
    userPermissions: ['Administrator'],

    async run({ message, args, client }) {
        
    }
})