import { Command } from "../../../../Structure/CommandSlash";

export default new Command({
    name: 'test',
    description: 'Test',
    category: 'Test',

    async run({ interaction }) {
        interaction.reply('Tested')
    }
})