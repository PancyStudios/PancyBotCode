/*
 * =================================================================
 * /src/structures/Client.ts (AHORA MUCHO MÁS LIMPIO)
 * =================================================================
 *
 * La clase principal del cliente. Ahora delega la carga de comandos
 * y eventos a sus respectivos manejadores. Es mucho más fácil de leer.
 */
import {Client, Collection, GatewayIntentBits, Partials} from "discord.js";
import {CommandType} from "../Types/CommandSlash"; // Asumiendo una carpeta 'types'
import {Poru} from "poru";
import {PoruClient} from "../Utils/Clients/Poru"; // Asumiendo una carpeta 'utils'
import {CommandHandler} from "./CommandHandler";
import {EventHandler} from "./EventHandler";

export class ExtendedClient extends Client {
    // Las colecciones ahora son parte del CommandHandler, pero podemos exponerlas aquí si es necesario.
    public commands: Collection<string, CommandType> = new Collection();
    public player: Poru;
    public commandHandler: CommandHandler;
    public eventHandler: EventHandler;

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildVoiceStates,
                // Añade solo los intents que realmente necesites
            ],
            shards: "auto",
            partials: [ Partials.Channel, Partials.User, Partials.GuildMember ],
            rest: {
                retries: 4,
                globalRequestsPerSecond: 50,
                timeout: 15000,
            }
        });
        console.warn('Iniciando cliente', 'Client');

        // Inicializamos los manejadores
        this.commandHandler = new CommandHandler(this);
        this.eventHandler = new EventHandler(this);
    }

    async start() {
        // Cargamos los módulos usando los manejadores
        await this.commandHandler.loadCommands();
        await this.eventHandler.loadEvents();

        // Iniciamos sesión
        await this.login(process.env.botToken);

        // El registro de comandos ahora se maneja en el evento 'ready'
        // dentro del EventHandler para asegurar que el bot esté listo.
        this.once('ready', (c) => {
            this.player = new PoruClient(c as ExtendedClient);
            this.commandHandler.registerCommands();
						this.player.init()
        });
    }
}
