import {ClientEvents} from "discord.js";
import {ExtendedClient} from "./Client";
import {Event} from "./Events"; // Asumiendo que tienes una clase base 'Event'
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
        console.log("[EventHandler] ✅ Iniciando carga de eventos...");
        const eventFiles = await glob(
            `${process.cwd()}/PancyBot/src/Events/*/*{.ts,.js}`
        );

        for (const filePath of eventFiles) {
            try {
                const event = await this.importFile(filePath);
                if (!event || !event.event) continue;

                this.client.on(event.event, event.run);
                console.log(`[EventHandler] ✅ Evento cargado: ${event.event}`);
            } catch (error) {
                console.error(`[EventHandler] ❌ Error al cargar evento en ${filePath}:`, error);
            }
        }
    }
}
