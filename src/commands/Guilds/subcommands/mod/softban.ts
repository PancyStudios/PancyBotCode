import { Command } from "../../../Structure/CommandMsg";
import { EmbedBuilder } from "discord.js";
import { utils } from "../../../..";

const prefix = "pan!"

export default new Command({
    name: "softban",
    aliases: ["sb"],
    description: "Softbans a user",
    category: "mod",
    use: "<user> [reason]",
    isDev: false,
    botPermissions: ["BanMembers"],
    userPermissions: ["BanMembers"],

    async run ({ client, message, args }) {
        const userBan = message.mentions.members.first();
        if(!userBan) return utils.dataRequired("Necesitas mencionar a un usuario" + `${prefix}softban <user> [reason]`);
        if(!message.guild.members.resolve(userBan)) return utils.dataRequired("El usuario mencionado no esta en el servidor" + `${prefix}softban <user> [reason]`);
        if(userBan.id === message.author.id) return utils.dataRequired("No puedes softban a ti mismo" + `${prefix}softban <user> [reason]`);
        if(userBan.id === message.guild.ownerId) return utils.dataRequired("No puedes softban al dueño del servidor" + `${prefix}softban <user> [reason]`);
        if(userBan.id === client.user.id) return utils.dataRequired("No puedes softban al bot" + `${prefix}softban <user> [reason]`);
        if(userBan.roles.highest.position >= message.member.roles.highest.position) return utils.dataRequired("No puedes softban a un usuario con un rol mayor o igual al tuyo" + `${prefix}softban <user> [reason]`);
        if(userBan.roles.highest.position >= message.guild.members.cache.get(client.user.id).roles.highest.position) return utils.dataRequired("No puedes softban a un usuario con un rol mayor o igual al del bot" + `${prefix}softban <user> [reason]`);
        if(userBan.roles.highest.position >= message.guild.members.cache.get(message.guild.ownerId).roles.highest.position) return utils.dataRequired("No puedes softban a un usuario con un rol mayor o igual al del dueño del servidor" + `${prefix}softban <user> [reason]`);
        if(args[1].length > 1024) return utils.dataRequired("La razon no puede superar los 1024 caracteres" + `${prefix}softban <user> [reason]`);
        if(!userBan.bannable) return utils.dataRequired("No puedo banear a este usuario" + `${prefix}softban <user> [reason]`);
        const reason = (args.slice(1) as string[]).join(" ") || "No reason provided";

        await userBan.send(`Has sido softbanned por ${message.author.tag} por la razon: ${reason}`);
        await userBan.ban({ reason: reason, deleteMessageSeconds: 604800 })
        await message.guild.bans.remove(userBan, 'Softban completado')

    }
})