import {EmbedBuilder} from "discord.js";
import {client} from "../../index"

const usersWithCooldown = new Map();
const cooldown = new Map();
const responses = new Map();

export class PancyBotUtils { 
    constructor(){}
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

    // async ratelimitFilter(message: Message) {
    //     if(usersWithCooldown.has(message.author.id)) {
    //         let seeCooldown = await usersWithCooldown.get(message.author.id);
    //         if(seeCooldown != new Date().getHours()) {
    //             usersWithCooldown.delete(message.author.id);
    //         }else return false;
    //     }
    //
    //     if(!cooldown.has(message.author.id)) {
    //         cooldown.set(message.author.id, 1);
    //     }
    //
    //     let stop = await cooldown.get(message.author.id);
    //
    //     if(stop >= 3) {
    //         message.channel.send(`Debido a la inundación de comandos, has sido limitado (Es decir, no podrás usar comandos) durante ${60 - new Date().getMinutes()} minutos.`);
    //         usersWithCooldown.set(message.author.id, parseInt(new Date().getHours().toString()));
    //         return false;
    //     }else{
    //
    //         if(stop == 2) message.channel.send('Escribe los comandos de forma más lenta o serás limitado.').then(x => {
    //             setTimeout(() => {
    //                 x.delete();
    //             }, 1500);
    //         });
    //
    //         cooldown.set(message.author.id, await cooldown.get(message.author.id) +1);
    //
    //         setTimeout(async () => {
    //             cooldown.set(message.author.id, await cooldown.get(message.author.id) -1);
    //         }, 1000);
    //
    //         return true;
    //     }
    // }

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