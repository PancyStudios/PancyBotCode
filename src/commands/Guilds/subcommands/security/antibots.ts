import { ApplicationCommandOptionType } from "discord.js";
import { Command } from "../../../../Structure/CommandSlash";

export default new Command({
    name: "antibots",
    description: "Evita que se unan bots segun su tipo",
    category: 'security',
    options: [
        {
            name: "type",
            description: "Que tipo de bots expulso?",
            type: ApplicationCommandOptionType.String,
            choices: [
                {
                    name: 'All bots',
                    value: 'all'
                },
                {
                    name: 'Unverified bots',
                    value: 'only_nv'
                },
                {
                    name: 'Verified bots',
                    value: 'only_v'
                }
            ],
            required: true 
        }
    ],
    botPermissions: ['KickMembers'],

    run: async ({ interaction, args }) => {
        
    }
})