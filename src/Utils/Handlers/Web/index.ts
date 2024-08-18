import express, { Request, Response, NextFunction} from "express";
import rateLimit from "express-rate-limit";
import { json, urlencoded } from 'body-parser';
import { RouterVotos } from '../../../Events/Client/Top.gg'
import { ApiRouter } from "./Routes/Api";
import { EmbedBuilder, WebhookClient } from "discord.js";
import hastebin from "hastebin-gen";
import { client } from "../../..";

export const app = express()

const limiter = rateLimit({
    windowMs:  60 * 1000,
    max: 100,
    message: {
        error: 'Demasiadas solicitudes, por favor intente de nuevo más tarde.'
    },
    statusCode: 429,
    headers: true, 
});

function logsServer(req: Request, res: Response, next: NextFunction) {
    try {
        const Webhook = new WebhookClient({ url: process.env.logsWebServerWebhook })
        if(req.method === 'GET') {
            const Embed = new EmbedBuilder()
            .setTitle(`Logs server - Nueva solicitud GET`)
            .setDescription(`> **IP:** ${req.ip}\n> **URL:** ${req.url}\n> **Query:** ${req.query}\n> **Headers:** ${req.headers}\n> **Body:** ${req.body}`)
            .setColor('Green')
            .setTimestamp()
            .setFooter({ text: `${client.isReady() ? client.user.displayName : 'PancyWeb (NOT DJS CLIENT)'}` })

            Webhook.send({ embeds: [Embed] })
        } else if(req.method === 'POST') {
            const bodyLength = JSON.stringify(req.body).length;
            if(bodyLength > 3500) {
                hastebin(JSON.stringify(req.body), { extension: 'json' }).then((url) => {
                    console.log(`El cuerpo de la solicitud es demasiado largo, se ha subido a hastebin: ${url}`)
                    
                    const Embed = new EmbedBuilder()
                    .setTitle(`Logs server - Nueva solicitud POST`)
                    .setDescription(`> **IP:** ${req.ip}\n> **URL:** ${req.url}\n> **Query:** ${req.query}\n> **Headers:** ${req.headers}\n> **Body:** ${url}`)
                    .setColor('Green')
                    .setTimestamp()
                    .setFooter({ text: `${client.isReady() ? client.user.displayName : 'PancyWeb (NOT DJS CLIENT)'}` })

                    Webhook.send({ embeds: [Embed] })
                })
            } else {
                const Embed = new EmbedBuilder()
                .setTitle(`Logs server - Nueva solicitud POST`)
                .setDescription(`> **IP:** ${req.ip}\n> **URL:** ${req.url}\n> **Query:** ${req.query}\n> **Headers:** ${req.headers}\n> **Body:** ${req.body}`)
                .setColor('Green')
                .setTimestamp()
                .setFooter({ text: `${client.isReady() ? client.user.displayName : 'PancyWeb (NOT DJS CLIENT)'}` })

                Webhook.send({ embeds: [Embed] })
            }
        } else if(req.method === 'PUT') {
            const Embed = new EmbedBuilder()
            .setTitle(`Logs server - Nueva solicitud PUT`)
            .setDescription(`> **IP:** ${req.ip}\n> **URL:** ${req.url}\n> **Query:** ${req.query}\n> **Headers:** ${req.headers}\n> **Body:** ${req.body}`)
            .setColor('Green')
            .setTimestamp()
            .setFooter({ text: `${client.isReady() ? client.user.displayName : 'PancyWeb (NOT DJS CLIENT)'}` })

            Webhook.send({ embeds: [Embed] })
        } else if(req.method === 'DELETE') {
            const Embed = new EmbedBuilder()
            .setTitle(`Logs server - Nueva solicitud DELETE`)
            .setDescription(`> **IP:** ${req.ip}\n> **URL:** ${req.url}\n> **Query:** ${req.query}\n> **Headers:** ${req.headers}\n> **Body:** ${req.body}`)
            .setColor('Green')
            .setTimestamp()
            .setFooter({ text: `${client.isReady() ? client.user.displayName : 'PancyWeb (NOT DJS CLIENT)'}` })

            Webhook.send({ embeds: [Embed] })
        } else if(req.method === 'PATCH') {
            const Embed = new EmbedBuilder()
            .setTitle(`Logs server - Nueva solicitud PATCH`)
            .setDescription(`> **IP:** ${req.ip}\n> **URL:** ${req.url}\n> **Query:** ${req.query}\n> **Headers:** ${req.headers}\n> **Body:** ${req.body}`)
            .setColor('Green')
            .setTimestamp()
            .setFooter({ text: `${client.isReady() ? client.user.displayName : 'PancyWeb (NOT DJS CLIENT)'}` })

            Webhook.send({ embeds: [Embed] })
        }

        next()
    } catch (error) {
        console.error(error)
        next()
    }
}

app.set('trust proxy', 1);
app.use(json());
app.use(urlencoded({ extended: true }));
app.use('/votos', RouterVotos);
app.use(logsServer);
app.use(limiter);
app.use('/api', ApiRouter);
app.all('*', (req, res) => {
    res.json({ message: 'Not Found' }).status(404)
})