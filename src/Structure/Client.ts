import {
    ApplicationCommandDataResolvable,
    Client,
    ClientEvents,
    Collection,
    Partials,
    GatewayIntentBits,
    ChatInputApplicationCommandData,
    ApplicationCommandOptionType,
} from "discord.js";
import { CommandType } from "../Types/CommandSlash";
import glob from "glob";
import { promisify } from "util";
import { RegisterCommandsOptions } from "../Types/Client";
import { Event } from "./Events"; 
import { Poru } from "poru";
import { PoruClient } from "../Utils/Clients/Poru";
import path from 'path';
const globPromise = promisify(glob);

export class ExtendedClient extends Client {
    commands: Collection<string, CommandType> = new Collection();
    subcommands: Collection<string, string> = new Collection();
    subcommandsGroup: Collection<string, string> = new Collection();
    subcommandsCategory: Collection<string, string> = new Collection();
    commandsDev: Collection<string, CommandType> = new Collection();
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
                timeout: 15000,
            }

        });
        console.warn('Iniciando cliente', 'Client')
    }

    async start() {
        await this.registerModules();
        await this.login(process.env.botToken);
    }

    async importFile(filePath: string) {
        return (await import(filePath))?.default;
    }

    async registerCommands({ commands, guildId }: RegisterCommandsOptions) {
        if (guildId) {
            await this.guilds.cache.get(guildId)?.commands.set(commands);
            console.log(`Registering commands to ${guildId}`, 'API DC');
        }
        else {
            await this.application?.commands.set(commands);
            console.log("Registering global commands", 'API DC');
        }              
    }

    async registerModules() {
        // Commands
        const slashCommands: ApplicationCommandDataResolvable[] = [];
        const slashCommandsDev: ApplicationCommandDataResolvable[] = [];

        const integratedCommandsDirUser = await globPromise(
            `${process.cwd()}/src/commands/Users/*`
        );

        const integratedCommandsDirGuild = await globPromise(
            `${process.cwd()}/src/commands/Guilds/*`
        );

        for(const dir of integratedCommandsDirGuild) {
            const nameDir = path.basename(dir);
            switch(nameDir) {
                case 'commands': 
                    const commandFiles = await globPromise(
                        `${dir}/*/*{.js,.ts}`
                    );
        
                    for (const filePath of commandFiles) {
                        const command: CommandType = await this.importFile(filePath);
                        if (!command?.name) continue;
            
                        this.commands.set(command.name, command)
                        slashCommands.push(command);
                    }
                    break;
                case 'subcommands':
                    const commandSubCategories = await globPromise(
                        `${dir}/*`
                    );

                    for (const categoryPath of commandSubCategories) {
                        // Obtener los archivos de subcomandos dentro de la categoría
                        const categoryName = path.basename(categoryPath);
                        const commandFiles = await globPromise(
                            `${categoryPath}/*{.js,.ts}`
                        );

                        this.subcommands.set(categoryName, categoryName)
                        
                        let categoryCommand = {
                            name: categoryName,
                            type: 1,
                            description: `${categoryName} commands (Si ves esta descripcion, no ejecutar el comando)`,
                            options: [],
                        };

                        for (const filePath of commandFiles) {
                            const command: CommandType = await this.importFile(filePath);
                            if (!command?.name) continue
                            const subCommand = {
                                name: command.name,
                                type: 1,
                                description: command.description,
                                options: command.options
                            }
                            categoryCommand.options.push(subCommand)
                            this.commands.set(`${categoryName}.${command.name}`, command)
                        }

                        slashCommands.push(categoryCommand);
                    }
                    break;
                case 'subcommandsgroup':
                    const commandGroupSubCategories = await globPromise(
                        `${process.cwd()}/src/commands/subcommand_group/*`
                    );
            
                    for (const subGroupcommandsPath of commandGroupSubCategories) {
                        // Obtener los archivos de subcomandos dentro de la categoría
                        const categoryGroup = path.basename(subGroupcommandsPath);
                        const subGroupCommands = await globPromise(
                            `${subGroupcommandsPath}/*`
                        );
            
                        this.subcommandsGroup.set(categoryGroup, categoryGroup)
            
                        let categoryGroupCommand = {
                            name: categoryGroup,
                            type: 1,
                            description: `${categoryGroup} commands (Si ves esta descripcion, no ejecutar el comando)`,
                            options: [],
                        };
            
                        for (const categoryPath of subGroupCommands) {
                            // Obtener los archivos de subcomandos dentro de la categoría
                            const categoryName = path.basename(categoryPath);
                            const commandFiles = await globPromise(
                                `${categoryPath}/*`
                            );
            
                            let subCommand = {
                                name: categoryName,
                                type: ApplicationCommandOptionType.SubcommandGroup,
                                description: `${categoryName} commands (Si ves esta descripcion, no ejecutar el comando)`,
                                options: [],
                            };
                
                            this.subcommandsCategory.set(categoryName, categoryName)
                
                            for (const filePath of commandFiles) {
                                const command: CommandType = await this.importFile(filePath);
                                if (!command?.name) continue
                                let otherCommand = {
                                    name: command.name, 
                                    description: command.description,
                                    type: ApplicationCommandOptionType.Subcommand,
                                    options: command.options
                                }
                                subCommand.options.push(otherCommand)
                                this.commands.set(`${categoryGroup}.${categoryName}.${command.name}`, command)
                            }
            
                            categoryGroupCommand.options.push(subCommand)
                        }
                        slashCommands.push(categoryGroupCommand);
                    }            
                    break;
                case 'Dev':
                    const integratedCommandsDirGuildDev = await globPromise(
                        `${process.cwd()}/src/commands/Guilds/*`
                    );
                    for(const dirDev of integratedCommandsDirGuildDev) {
                        const nameDirDev = path.basename(dirDev);   
                        switch(nameDirDev) {
                            case 'commands': 
                                const commandFiles = await globPromise(
                                    `${dir}/*/*{.js,.ts}`
                                );
                    
                                for (const filePath of commandFiles) {
                                    const command: CommandType = await this.importFile(filePath);
                                    if (!command?.name) continue;
                        
                                    this.commands.set(command.name, command)
                                    slashCommandsDev.push(command);
                                }
                                break;
                            case 'subcommands':
                                const commandSubCategories = await globPromise(
                                    `${dir}/*`
                                );
            
                                for (const categoryPath of commandSubCategories) {
                                    // Obtener los archivos de subcomandos dentro de la categoría
                                    const categoryName = path.basename(categoryPath);
                                    const commandFiles = await globPromise(
                                        `${categoryPath}/*{.js,.ts}`
                                    );
            
                                    this.subcommands.set(categoryName, categoryName)
                                    
                                    let categoryCommand = {
                                        name: categoryName,
                                        type: 1,
                                        description: `${categoryName} commands (Si ves esta descripcion, no ejecutar el comando)`,
                                        options: [],
                                    };
            
                                    for (const filePath of commandFiles) {
                                        const command: CommandType = await this.importFile(filePath);
                                        if (!command?.name) continue
                                        categoryCommand.options.push(command)
                                        this.commands.set(`${categoryName}.${command.name}`, command)
                                    }
            
                                    slashCommandsDev.push(categoryCommand);
                                }
                                break;
                            case 'subcommandsgroup':
                                const commandGroupSubCategories = await globPromise(
                                    `${process.cwd()}/src/commands/subcommand_group/*`
                                );
                        
                                for (const subGroupcommandsPath of commandGroupSubCategories) {
                                    // Obtener los archivos de subcomandos dentro de la categoría
                                    const categoryGroup = path.basename(subGroupcommandsPath);
                                    const subGroupCommands = await globPromise(
                                        `${subGroupcommandsPath}/*`
                                    );
                        
                                    this.subcommandsGroup.set(categoryGroup, categoryGroup)
                        
                                    let categoryGroupCommand = {
                                        name: categoryGroup,
                                        type: 1,
                                        description: `${categoryGroup} commands (Si ves esta descripcion, no ejecutar el comando)`,
                                        options: [],
                                    };
                        
                                    for (const categoryPath of subGroupCommands) {
                                        // Obtener los archivos de subcomandos dentro de la categoría
                                        const categoryName = path.basename(categoryPath);
                                        const commandFiles = await globPromise(
                                            `${categoryPath}/*`
                                        );
                        
                                        let subCommand = {
                                            name: categoryName,
                                            type: 1,
                                            description: `${categoryName} commands (Si ves esta descripcion, no ejecutar el comando)`,
                                            options: [],
                                        };
                            
                                        this.subcommandsCategory.set(categoryName, categoryName)
                            
                                        for (const filePath of commandFiles) {
                                            const command: CommandType = await this.importFile(filePath);
                                            
                                            if (!command?.name) continue
                                            subCommand.options.push(command)
                                            this.commands.set(`${categoryGroup}.${categoryName}.${command.name}`, command)
                                        }
                        
                                        categoryGroupCommand.options.push(subCommand)
                                    }
                                    slashCommandsDev.push(categoryGroupCommand);
                                }            
                                break;
                        }
                    }
                    break;
            }
        }

        this.on("ready", async (_) => {
            this.player = new PoruClient(this)
            this.registerCommands({ commands: slashCommands })
            this.registerCommands({ commands: slashCommandsDev, guildId: '763801211384102962' })
            console.debug(slashCommands)
            console.debug(slashCommandsDev)
            console.debug("Client.ts is ready")
        });

        // Event
        const eventFiles = await globPromise(
            `${process.cwd()}/src/Events/*/*{.ts,.js}`
        );
        eventFiles.forEach(async (filePath) => {
            const event: Event<keyof ClientEvents> = await this.importFile(
                filePath
            );

            if(!event.event) return
            console.log(event.event, 'Loading')
            this.on(event.event, event.run);
        });
    }
}