import { Command } from "../../../../Structure/CommandSlash";
import { utils } from "../../../..";
import { GuildMember } from "discord.js";

const prefix = "pan!"

export default new Command({
    name: "softban",
    description: "Softbans a user",
    category: "mod",
    isDev: false,
    botPermissions: ["BanMembers"],
    userPermissions: ["BanMembers"],
    options: [
        {
            name: "user",
            description: "User to softban",
            type: 6,
            required: true
        }, 
        {
            name: "reason",
            description: "Reason for softban",
            type: 3,
            required: false
        }
    ],


    async run ({ client, interaction, args }) {
        const userBan = args.getMember("user") as GuildMember;
        const reason2 = args.getString("reason");
        if(!userBan) return utils.dataRequired("Necesitas mencionar a un usuario" + `${prefix}softban <user> [reason]`);
        if(!interaction.guild.members.resolve(userBan)) return utils.dataRequired("El usuario mencionado no esta en el servidor" + `${prefix}softban <user> [reason]`);
        if(userBan.id === interaction.user.id) return utils.dataRequired("No puedes softban a ti mismo" + `${prefix}softban <user> [reason]`);
        if(userBan.id === interaction.guild.ownerId) return utils.dataRequired("No puedes softban al dueño del servidor" + `${prefix}softban <user> [reason]`);
        if(userBan.id === client.user.id) return utils.dataRequired("No puedes softban al bot" + `${prefix}softban <user> [reason]`);
        if(userBan.roles.highest.position >= interaction.member.roles.highest.position) return utils.dataRequired("No puedes softban a un usuario con un rol mayor o igual al tuyo" + `${prefix}softban <user> [reason]`);
        if(userBan.roles.highest.position >= interaction.guild.members.cache.get(client.user.id).roles.highest.position) return utils.dataRequired("No puedes softban a un usuario con un rol mayor o igual al del bot" + `${prefix}softban <user> [reason]`);
        if(userBan.roles.highest.position >= interaction.guild.members.cache.get(interaction.guild.ownerId).roles.highest.position) return utils.dataRequired("No puedes softban a un usuario con un rol mayor o igual al del dueño del servidor" + `${prefix}softban <user> [reason]`);
        if(args[1].length > 1024) return utils.dataRequired("La razon no puede superar los 1024 caracteres" + `${prefix}softban <user> [reason]`);
        if(!userBan.bannable) return utils.dataRequired("No puedo banear a este usuario" + `${prefix}softban <user> [reason]`);
        const reason = reason2 != '' ? reason2 : "No reason provided";

        await userBan.send(`Has sido softbanned por ${interaction.user.tag} por la razon: ${reason}`);
        await userBan.ban({ reason: reason, deleteMessageSeconds: 604800 })
        await interaction.guild.bans.remove(userBan, 'Softban completado')

    }
})