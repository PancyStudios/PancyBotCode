import {EmbedBuilder, WebhookClient} from 'discord.js'
import {version} from '../../../../../package.json'
import {client} from '../../../index'
import {ReportErrorOptions} from '../../../Types/Error'


export class ErrorHandler {
    webhook: WebhookClient;

    constructor() {
        this.start()
        this.webhook = new WebhookClient({ url: process.env.errorWebhook })
    }

    start() {
        let errors = 0
        const clearErrorMax = setInterval(() => {
            errors = 0
        }, 5000)

        const autoKill = setInterval(() => {
            if(errors > 15) {
                const time = Date.now()
                console.warn("Se detecto un numero demaciado alto de errores", 'CRITICAL')
                console.warn("Apagando...", 'CRITICAL')
                this.report({ error: "Critical Error", message: "Numero inusual de errores. Apagando..."})
                clearInterval(clearErrorMax)
                client.destroy()
                const finalTime = Date.now() - time
                console.warn("Finalizando proceso... Tiempo total: "+finalTime+"", 'CRITICAL')
                process.abort()
            }   
        }, 1000)

        process.on('unhandledRejection', async (err: Error) => {
            errors++;
            console.error(errors)
            console.debug('Unhandled Rejection/Catch', 'AntiCrash');
            console.error(err);
            
        });
        process.on("uncaughtException", (err, origin) => {
            console.debug('Uncaught Exception/Catch', 'AntiCrash');
            console.error(err);
            console.error(origin);
            errors++;
            console.error(errors)
        });
        process.on('uncaughtExceptionMonitor', (err, origin) => {
            console.debug('Uncaught Exception/Catch (MONITOR)', 'AntiCrash');
            console.error(err);
            console.error(origin);
            errors++;
        });
    }

    async report(data: ReportErrorOptions) {

        const Embed = new EmbedBuilder()
        .setAuthor({ name: `Error ${data.error}`})
        .setDescription(`${data.message}`)
        .setColor('Red')
        .setFooter({ text: `Pancybot v${version}` })

        const message = await this.webhook.send({
            embeds: [
                Embed
            ],
        })

        console.warn(`Sent ErrorReport to Webhook, Type: ${message.type}`, 'AntiCrash');
    }
}