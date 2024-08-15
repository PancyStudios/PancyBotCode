import { CommandInteractionOptionResolver, GuildMember } from "discord.js";
import { client, utils } from '../..';
import { Event } from "../../Structure/Events";
import { ExtendedInteraction } from "../../Types/CommandSlash";
import { botStaff, forceDisableCommandsSlash } from '../../Database/Local/variables.json'
import { GuildDataFirst } from "../../Database/Type/Security";
import { Guild } from "../../Database/BotDataBase";
import { install_commands } from "../../Utils/Handlers/DatabaseHandler";
let prefix: string
let guildDb: GuildDataFirst


export default new Event("interactionCreate", async (interaction) => {
    if (interaction.isChatInputCommand()) {
        
    } else if(interaction.isCommand()) {

    }
});
