import winston from 'winston';
import {Colors, EmbedBuilder, WebhookClient} from 'discord.js';
import Transport from 'winston-transport';
import path from 'path';

// --- Definición de Niveles y Colores ---
const logLevels = {
    levels: {
        critical: 0,
        error: 1,
        warn: 2,
        success: 3,
        info: 4,
        debug: 5,
        system: 6,
    },
    colors: {
        critical: 'bold red',
        error: 'red',
        warn: 'yellow',
        success: 'green',
        info: 'cyan',
        debug: 'magenta',
        system: 'blue',
    },
};

winston.addColors(logLevels.colors);

// --- Transport Personalizado para Webhooks de Discord ---
class DiscordWebhookTransport extends Transport {
    private webhookClient: WebhookClient;
    private levelColorMap: Record<string, number> = {
        critical: Colors.Red,
        error: Colors.Red,
        warn: Colors.Yellow,
        success: Colors.Green,
        info: Colors.Blue,
        debug: Colors.Purple,
        system: Colors.Grey,
    };

    constructor(opts) {
        super(opts);
        if (opts.webhookUrl) {
            this.webhookClient = new WebhookClient({ url: opts.webhookUrl });
        }
    }

    log(info, callback) {
        setImmediate(() => {
            this.emit('logged', info);
        });

        if (!this.webhookClient) {
            return callback();
        }

        const { level, message, timestamp, prefix, stack } = info;

        const embed = new EmbedBuilder()
            .setColor(this.levelColorMap[level] || Colors.Default)
            .setTitle(`[${level.toUpperCase()}] ${prefix || 'SYS'}`)
            .setDescription(`\`\`\`${stack || message}\`\`\``)
            .setFooter({ text: ``})
            .setTimestamp(new Date(timestamp));

        this.webhookClient.send({ embeds: [embed] }).catch(console.error);

        callback();
    }
}

// --- Formato del Logger para la Consola ---
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.splat(),
    winston.format.colorize({ all: true }), // Colorea todo para la consola
    winston.format.printf((info) => {
        const { timestamp, level, message, prefix = 'SYS' } = info;
        return `[${timestamp}] [${level}] [${prefix}]: ${message}`;
    })
);

// --- Formato para los Archivos (sin colores) ---
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.splat(),
    winston.format.printf((info) => {
        const { timestamp, level, message, prefix = 'SYS' } = info;
        return `[${timestamp}] [${level.toUpperCase()}] [${prefix}]: ${message}`;
    })
);

// --- Creación de la Instancia del Logger ---
const logger = winston.createLogger({
    level: 'system', // Nivel máximo a loguear en general
    levels: logLevels.levels,
    transports: [
        // Transport para la consola
        new winston.transports.Console({
            format: consoleFormat,
        }),
        // Transport para el archivo de errores
        new winston.transports.File({
            filename: path.join(process.cwd(), 'logs', 'error.log'),
            level: 'error',
            format: fileFormat,
        }),
        // Transport para el archivo combinado
        new winston.transports.File({
            filename: path.join(process.cwd(), 'logs', 'combined.log'),
            format: fileFormat,
        }),
        // Transport para el webhook de ERRORES
        new DiscordWebhookTransport({
            level: 'error', // Solo captura 'error' y 'critical'
            webhookUrl: process.env.errorWebhook,
        }),
        // Transport para el webhook de LOGS NORMALES
        new DiscordWebhookTransport({
            level: 'system', // Captura todo hasta el nivel 'system'
            webhookUrl: process.env.logsWebhook,
            // Añadimos un filtro para excluir los niveles de error
            format: winston.format((info) => {
                const errorLevels = ['error', 'critical'];
                if (errorLevels.includes(info.level)) {
                    return false; // No loguear si es un nivel de error
                }
                return info;
            })(),
        }),
    ],
});

export { logger };