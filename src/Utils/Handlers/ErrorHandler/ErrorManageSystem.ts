import { WebhookClient, EmbedBuilder } from 'discord.js'
import { existsSync, mkdirSync, writeFileSync} from 'fs'
import { version } from '../../../../package.json'
import { client, logs } from '../../..'
import winston from 'winston'
import { ReportErrorOptions } from '../../../Types/Error'

const logger = winston.createLogger({
    level: 'error',
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: 'error.log' }),
    ],
  });

const Webhook = new WebhookClient({ url: 'https://discord.com/api/webhooks/1251718990418411612/gIfSGc2UBDRiJVBnI9V56KLWIDL2qsJkR-BnGvFlxcNisBOyOfeB3VAbyF7bUTDyVsOK' })

export class ErrorHandler {
    constructor() {}

    start() {
        let errors = 0
        const clearErrorMax = setInterval(() => {
            errors = 0
        }, 5000)

        const autoKill = setInterval(() => {
            if(errors > 15) {
                const time = Date.now()
                logs.warn("[CRITICAL] Se detecto un numero demaciado alto de errores")
                logs.warn("[CRITICAL] Apagando...")
                this.report({ error: "Critical Error", message: "Numero inusual de errores. Apagando..."})
                clearInterval(clearErrorMax)
                client.destroy()
                const finalTime = Date.now() - time
                logs.warn("[CRITICAL] Finalizando proceso... Tiempo total: "+finalTime+"")
                process.abort()
            }   
        }, 1000)

        process.on('unhandledRejection', async (err, reason, p,) => {
            errors++;
            logs.log(`${errors}`)
            logs.log(' [antiCrash] :: Unhandled Rejection/Catch');
            logs.log(`${reason} ${p}`);
            logger.error(`unhandled Rejection: ${err.message}`)
            const data = `${reason} ${p}`
            if (!existsSync(`${process.cwd()}/ErrorLogs`)) {
                mkdirSync(`${process.cwd()}/ErrorLogs`, { recursive: true});
            }
            
            writeFileSync(""+process.cwd()+"/ErrorLogs/unhandledRejection_"+Date.now()+".log", data);

            const Embed = new EmbedBuilder()
            .setAuthor({ name: 'CrashReport'})
            .setDescription(`CrashError: ${reason} ${p}`)
            .setColor('Red')
            .setFooter({ text: `Pancybot v${version}` })

            const message = await Webhook.send({
                username: `PancyBot ${version} | CrashError`,
                avatarURL: 'https://califerbot.tk/assets/img/LaTurbis.jpg',
                embeds: [
                    Embed
                ],
            })

            logs.warn(`[AntiCrash] :: Sent CrashError to Webhook, Type: ${message.type}`);
            
        });
        process.on("uncaughtException", (err, origin) => {
            logs.log(' [antiCrash] :: Uncaught Exception/Catch');
            logs.log(`${err} ${origin}`);
            logger.error(`uncaught Exception: ${err.message}`)
            const data = `${err + origin}`
            if (!existsSync(`${process.cwd()}/ErrorLogs`)) {
                mkdirSync(`${process.cwd()}/ErrorLogs`, { recursive: true});
            }
            writeFileSync(""+process.cwd()+"/ErrorLogs/uncaughtException_"+Date.now()+".log", data);
            errors++;
            logs.log(`${errors}`)
        });
        process.on('uncaughtExceptionMonitor', (err, origin) => {
            logs.log(' [antiCrash] :: Uncaught Exception/Catch (MONITOR)');
            logs.log(`${err} ${origin}`);
            const data = `${err + origin}`
            if (!existsSync(`${process.cwd()}/ErrorLogs`)) {
                mkdirSync(`${process.cwd()}/ErrorLogs`, { recursive: true});
            }
    
            writeFileSync(""+process.cwd()+"/ErrorLogs/uncaughtExceptionMonitor_"+Date.now()+".log", data);
            errors++;
        });
    }

    async report(data: ReportErrorOptions) {

    }
}