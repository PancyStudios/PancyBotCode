import {
    ApplicationCommandDataResolvable,
    Client,
    ClientEvents,
    Collection,
    Partials,
    GatewayIntentBits,
} from "discord.js";
import { CommandType } from "../Types/CommandSlash";
import path from "path"
import { CommandTypeMsg } from "../Types/CommandMsg";
import glob from "glob";
import { promisify } from "util";
import { RegisterCommandsOptions } from "../Types/Client";
import { Event } from "./Events"; 
import { Poru } from "poru";
import { PoruClient } from "../Utils/Clients/Poru";
import { logs } from "..";
import { forceDisableCommandsMsg } from '../Database/Local/variables.json'
const globPromise = promisify(glob);

export class ExtendedClient extends Client {
    commands: Collection<string, CommandType> = new Collection();
    commandsDev: Collection<string, CommandType> = new Collection();
    commandsMsg: Collection<string, CommandTypeMsg> = new Collection();
    commandsIntegratedUser: Collection<string, CommandType> = new Collection();
    commandsIntegratedMessage: Collection<string, CommandType> = new Collection();
    player: Poru;

    constructor() {
        super({ 
            intents: [
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.GuildModeration,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildIntegrations,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.GuildWebhooks,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildEmojisAndStickers,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
            ],
            shards: "auto",
            partials: [
                Partials.Channel,
                Partials.User,
                Partials.GuildMember
            ],
            rest: {
                retries: 4,
                globalRequestsPerSecond: 50,
            }

        });
        logs.warn('Iniciando cliente')
    }
    

    async start() {
        await this.registerModules();
        await this.login(process.env.botToken);
    }

    async importFile(filePath: string) {
        return (await import(filePath))?.default;
    }

    async registerCommands({ commands, guildId, userId }: RegisterCommandsOptions) {
        if (guildId) {
            await this.guilds.cache.get(guildId)?.commands.set(commands);
            logs.log(`Registering commands to ${guildId}`);
        }
        else {
            await this.application?.commands.set(commands);
            logs.log("Registering global commands");
        }              
    }

    async registerModules() {
        // Commands
        const slashCommands: ApplicationCommandDataResolvable[] = [];
        const slashCommandsDev: ApplicationCommandDataResolvable[] = [];
        const integratedCommandsU: ApplicationCommandDataResolvable[] = [];
        const integratedCommandsM: ApplicationCommandDataResolvable[] = [];

        const commandFiles = await globPromise(
            `${process.cwd()}/src/Commands/interaction/*/*{.ts,.js}`
        );

        const integratedCommandsFilesUser = await globPromise(
            `${process.cwd()}/src/Commands/integrate/user/*/*{.ts,.js}`
        );

        const integratedCommandsFilesMessage = await globPromise(
            `${process.cwd()}/src/Commands/integrate/message/*/*{.ts,.js}`
        );
        commandFiles.forEach(async (filePath) => {
            const command: CommandType = await this.importFile(filePath);
            if (!command.name) return;
            logs.log(command as unknown as string);

            if (command.isDev) {
                this.commandsDev.set(command.name, command);
                slashCommandsDev.push(command);
            } else {
                this.commands.set(command.name, command);
                slashCommands.push(command);
            }
        });

        this.on("ready", async (final) => {
            this.player = new PoruClient(final as ExtendedClient)
            this.registerCommands({ commands: slashCommands })
            this.registerCommands({ commands: slashCommandsDev, guildId: '763801211384102962' })
            logs.debug("[DEBUG] Client.ts is ready")

        });
        //Message Commands

        const commandFilesMsg = await globPromise(
            `${process.cwd()}/src/Commands/message/*/*{.js,.ts}`
        )
        commandFilesMsg.forEach(async (filePath) => {
            const command: CommandTypeMsg = await this.importFile(filePath)
            logs.log(filePath)
            if(forceDisableCommandsMsg.some(x => x === command.name)) {
                logs.warn(`Comando Msg deshabilitado: ${command.name}`)
                return;
            }
            if(!command.name) return;
            logs.log(command as unknown as string)
            this.commandsMsg.set(command.name, command)
        })

        

        // Event
        const eventFiles = await globPromise(
            `${process.cwd()}/src/Events/*/*{.ts,.js}`
        );
        eventFiles.forEach(async (filePath) => {
            
            const event: Event<keyof ClientEvents> = await this.importFile(
                filePath
            );

            if(!event.event) return
            logs.log(event.event)
            this.on(event.event, event.run);
        });
    }
}