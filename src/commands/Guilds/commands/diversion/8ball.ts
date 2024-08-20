import { Command } from '../../../../Structure/CommandSlash'
import { utils } from '../../../..'
import { EmbedBuilder, Colors } from 'discord.js'
const prefix = 'pan!'

export default new Command({
    name: '8ball',
    description: "Preguntale algo al bot",
    category: "diversion",
    options: [
        {
            name: 'pregunta',
            description: 'Pregunta que quieres hacerle al bot',
            required: true,
            type: 3
        }
    ],

    async run({ interaction, args }) {
        const responses = ['Si', 'No', 'Tal vez', 'Probablemente', 'Probablemente no', 'No se', 'Tu que piensas?']
        const random = responses[Math.floor(Math.random() * responses.length)]
        const question = args.getString('pregunta')

        if(!question) return utils.dataRequired(`No se escribio una pregunta\n\n${prefix}8ball <Pregunta>`)
        
        const EmbedQuest = new EmbedBuilder()
        .setTitle('8ball')
        .setFields([
            {
                name: 'Pregunta',
                value: question
            },
            {
                name: 'Respuesta',
                value: random
            }
        ])
        .setFooter({ text: `${interaction.user.tag}`, iconURL: `${interaction.user.displayAvatarURL()}` })
        .setTimestamp()
        .setColor(Colors.Blurple)

        interaction.reply({ embeds: [EmbedQuest] })
    }
})