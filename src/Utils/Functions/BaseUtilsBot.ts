import { connection } from "mongoose";
import { Message, EmbedBuilder } from "discord.js";
import { warns } from "../../Database/Schemas/Warns";
import { Timers } from "../../Database/Schemas/Timers";
import { client } from "../.."
const usersWithCooldown = new Map();
const cooldown = new Map();
const responses = new Map();

export class PancyBotUtils { 
    constructor(){}

    getStatusDB () {
        var StringStatus = '| Unknown'
        var isOnline = false
        switch (connection.readyState) {
            case 0:
                StringStatus = '| Desconectado'
            break;
            case 1:
                StringStatus = '| En linea'
                isOnline = true
            break;
            case 2:
                StringStatus = '| Conectando'
                isOnline = true
            break;
            case 3:
                StringStatus = '| Desconectando'
            break;
            case 99:
                StringStatus = '| Error `MONGODB: 99`'
            break;
        }
        return {
            StringStatus,
            isOnline
        }
    }


async automoderator(client, mongoose, message, sanctionReason) {
    let userWarns = await warns.findOne({ guildId: message.guild.id, userId: message.author.id });
    if(!userWarns) {
        let newUser = new warns({
            guildId: message.guild.id,
            userId: message.author.id,
            warns: [],
            subCount: 1
        });
        userWarns = newUser;
        newUser.save();
        return;
    }

    if(userWarns.subCount >= 2) {
        userWarns.subCount = 0;

        userWarns.warns.push({
            reason: sanctionReason,
            moderator: `${client.user.id}`
        });
        userWarns.save();

        message.reply({ embeds: [ new EmbedBuilder().setColor(0x0056ff).setDescription(`<@${message.author.id}>, has sido advertido.\n\nRazón: \`${sanctionReason}\`\nModerador: \`${client.user.tag}\``) ] });

        if(userWarns.warns.length == mongoose.moderation.automoderator.actions.warns[0]) {
            if(message.member.roles.cache.has(mongoose.moderation.dataModeration.muterole))return;
            if(!message.guild.me.permissions.has('MANAGE_ROLES')) {
                client.users.cache.get(message.guild.ownerId).send('No tengo permisos para mutear a un usuario, he desactivado el automoderador.').catch(err => {
                    message.channel.send('<@' + message.guild.ownerId + '>, no tengo permisos para mutear al usuario, he desactivado el automoderador.');
                });
                mongoose.moderation.automoderator.enable = false;
                mongoose.save();
                return;
            }
            let remember = [];

            try{
                message.member.roles.cache.forEach(x => {
                    remember.push(x.id);
                    message.member.roles.remove(x.id).catch(err => {});
                });
            
                message.member.roles.add(mongoose.moderation.dataModeration.muterole).catch(err => {
                    message.channel.send(err);
                });
            }catch(err) {
                message.channel.send(err);
            }
            mongoose.moderation.dataModeration.timers.push({
                user: {
                    id: message.author.id,
                    username: message.author.username,
                    roles: remember
                },
                endAt: Date.now() + mongoose.moderation.automoderator.actions.muteTime[0],
                action: 'UNMUTE',
                channel: message.channel.id,
                inputTime: mongoose.moderation.automoderator.actions.muteTime[1]
            });
            mongoose.save();
            let _timers = await Timers.findOne({ });
            if(!(_timers.servers as unknown as Array<any>).includes(message.guild.id)) {
                (_timers.servers as unknown as Array<any>).push(message.guild.id);
                _timers.save();
            }
            message.reply({ content: `He muteado a \`${message.author.username}\` durante \`${mongoose.moderation.automoderator.actions.muteTime[1]}\` por tener demasiadas infracciónes.` });
        }else if(userWarns.warns.length > mongoose.moderation.automoderator.actions.warns[1]) {
            if(mongoose.moderation.automoderator.actions.action == 'BAN') {
                if(!message.guild.me.permissions.has('BAN_MEMBERS')) {
                    client.users.cache.get(message.guild.ownerId).send('No tengo permisos para banear a un usuario, he desactivado el automoderador.').catch(err => {
                        message.channel.send('<@' + message.guild.ownerId + '>, no tengo permisos para banear al usuario, he desactivado el automoderador.');
                    });
                    mongoose.moderation.automoderator.enable = false;
                    mongoose.save();
                    return;
                }
                message.guild.members.ban(message.author.id).then(() => {
                    message.channel.send('He baneado al usuario.');
                }).catch(err => {});
                return;
            }else{
                if(!message.guild.me.permissions.has('KICK_MEMBERS')) {
                    client.users.cache.get(message.guild.ownerId).send('No tengo permisos para expulsar a un usuario, he desactivado el automoderador.').catch(err => {
                        message.channel.send('<@' + message.guild.ownerId + '>, no tengo permisos para expulsar al usuario, he desactivado el automoderador.');
                    });
                    mongoose.moderation.automoderator.enable = false;
                    mongoose.save();
                    return;
                }
                message.guild.members.kick(message.author.id).then(() => {
                    message.channel.send('He expulsado al usuario.');
                }).catch(err => {});
                return;
            }
        }
        return;
    }else{
        userWarns.subCount = userWarns.subCount + 1;
        userWarns.save();
    }
}


    async dataRequired(message: string) {
        const dataRequiredEmbed = new EmbedBuilder().setColor('Red');
        dataRequiredEmbed.setDescription('`' + message + '`').setFooter({ text: 'Codigo Basado en TIB.' }); 
        return { content: '`[]` = Opcional.\n`<>` = Requerido.\n`{}` = Función.', embeds: [ dataRequiredEmbed ] };
    }
    
    pulk(array: Array<any>, object: Object) { // Sustituye <var>.splice();
        
        let newArray = [];
        for(let x of array) {
            if(x != object) {
                newArray.push(x);
            }
        }
        return newArray;
    }
    async ratelimitFilter(message: Message) {
        if(usersWithCooldown.has(message.author.id)) {
            let seeCooldown = await usersWithCooldown.get(message.author.id);
            if(seeCooldown != new Date().getHours()) {
                usersWithCooldown.delete(message.author.id);
            }else return false;
        }
    
        if(!cooldown.has(message.author.id)) {
            cooldown.set(message.author.id, 1);
        }
    
        let stop = await cooldown.get(message.author.id);
    
        if(stop >= 3) {
            message.channel.send(`Debido a la inundación de comandos, has sido limitado (Es decir, no podrás usar comandos) durante ${60 - new Date().getMinutes()} minutos.`);
            usersWithCooldown.set(message.author.id, parseInt(new Date().getHours().toString()));
            return false;
        }else{
            
            if(stop == 2) message.channel.send('Escribe los comandos de forma más lenta o serás limitado.').then(x => {
                setTimeout(() => {
                    x.delete();
                }, 1500);
            });
    
            cooldown.set(message.author.id, await cooldown.get(message.author.id) +1);
    
            setTimeout(async () => {
                cooldown.set(message.author.id, await cooldown.get(message.author.id) -1);
            }, 1000);
    
            return true;
        }
    }

    newResponse(response) {
        responses.set(response.authorId, response);
    }
    
    async getResponseAndDelete(userId) {
        if(responses.has(userId)) {
            let res = await responses.get(userId);
            responses.delete(userId);
            return res;
        }
    }
    
    botIsOnline() {
        const status = client.isReady()
        return status
    }
}