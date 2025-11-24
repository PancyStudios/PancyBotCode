import {ClientEvents} from "discord.js";
import {ExtendedClient} from "./Client";
import {Event} from "./Events"; // Asumiendo que tienes una clase base 'Event'
import fs from 'fs'
import path from 'path'
import {glob} from "glob";


export class EventHandler {
    public client: ExtendedClient;

    constructor(client: ExtendedClient) {
        this.client = client;
    }

    private async importFile(filePath: string): Promise<Event<keyof ClientEvents>> {
        return (await import(filePath))?.default;
    }

    public async loadEvents() {
        console.system("Iniciando carga de eventos...", "EventHandler");
        const eventsPath = path.join(process.cwd(), 'PancyBot', 'src', 'Events');

        if (!fs.existsSync(eventsPath)) {
            return console.warn(`El directorio de eventos no existe, omitiendo carga: ${eventsPath}`, "EventHandler");
        }

        const eventFiles = await glob(`${eventsPath}/*/*{.ts,.js}`).catch(err => {
            console.error(`Error al buscar eventos: ${err.message}`, 'EventHandler');
            return []; // Retorna un array vacío para prevenir el crash
        });

        for (const filePath of eventFiles) {
            try {
                const event = await this.importFile(filePath);
                if (!event || !event.event) continue;

                this.client.on(event.event, event.run);
                console.debug(`Evento cargado: ${event.event}`, 'EventHandler');
            } catch (error) {
                console.error(`Error al cargar el evento en ${filePath}: ${error.message}`, 'EventHandler');
            }
        }
    }
}
