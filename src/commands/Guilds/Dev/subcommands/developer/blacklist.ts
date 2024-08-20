import { Command } from "../../../../../Structure/CommandSlash";
import {ApplicationCommandOptionType} from 'discord.js'

export default new Command({
    name: "blacklist",
    description: "Añade o quita un usuario de la blacklist",
    category: 'dev',
    options: [
        {
            name: "add",
            description: "Añade un usuario a la blacklist",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "user",
                    description: "Usuario a añadir",
                    type: ApplicationCommandOptionType.User,
                    required: true
                }
            ]
        },
        {
            name: "remove",
            description: "Remueve un usuario de la blacklist",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "user",
                    description: "Usuario a remover",
                    type: ApplicationCommandOptionType.User,
                    required: true
                }
            ]
        }
    ],
    isDev: true,
    botPermissions: ['SendMessages', 'EmbedLinks'],

    run: async ({ interaction, args }) => {
        const command = args.getSubcommand()
        const user = args.getUser("user")

        if(!user) return interaction.followUp({ content: 'Usuario no encontrado', ephemeral: true })

        switch (command) {
            case 'add':
                interaction.followUp({ content: 'Ejecutado con exito "Add", no hay contenido para ejecutar', ephemeral: true })
                break;
            case 'remove':
                interaction.followUp({ content: 'Ejecutado con exito "Remove", no hay contenido para ejecutar', ephemeral: true })
                break;
        }
    }
})