/*
 * =================================================================
 * /src/structures/CommandHandler.ts (NUEVA CLASE)
 * =================================================================
 *
 * Esta clase se encarga de TODO lo relacionado con los comandos:
 * leerlos, construirlos y registrarlos en la API de Discord.
 */
import {ApplicationCommandDataResolvable, ApplicationCommandOptionType, Collection} from "discord.js";
import {ExtendedClient} from "./Client";
import {CommandType} from "../Types/CommandSlash";
import fs from 'fs';
import {glob} from "glob";
import path from "path";

export class CommandHandler {
    public client: ExtendedClient;
    public commands: Collection<string, CommandType> = new Collection();
    private slashCommands: ApplicationCommandDataResolvable[] = [];
    private slashCommandsDev: ApplicationCommandDataResolvable[] = [];

    constructor(client: ExtendedClient) {
        this.client = client;
    }

    private async importFile(filePath: string): Promise<CommandType> {
        return (await import(filePath))?.default;
    }

    private async findFiles(pattern: string): Promise<string[]> {
        try {
            console.debug(`Buscando archivos con el patrón: ${pattern}`, 'CommandHandler');
            const files = await glob(pattern);
            return Array.isArray(files) ? files : [];
        } catch (error) {
            console.error(`Error al buscar archivos con el patrón ${pattern}: ${error.message}`, 'CommandHandler');
            return [];
        }
    }
    public async loadCommands() {
        console.system("Iniciando carga de comandos...", "CommandHandler");
        const basePath = path.join(process.cwd(), 'PancyBot', 'src', 'commands');

        const commandTypes = ['Users', 'Guilds'];

        for (const type of commandTypes) {
            const dirPath = path.join(basePath, type);
            if (!fs.existsSync(dirPath)) continue;

            await this._loadSimpleCommands(path.join(dirPath, 'commands'));
            await this._loadSubcommands(path.join(dirPath, 'subcommands'));
            await this._loadSubcommandGroups(path.join(dirPath, 'subcommandsgroup'));
        }
        console.system(`Carga finalizada. ${this.commands.size} comandos registrados en la colección.`, "CommandHandler");
    }

    private async _loadSimpleCommands(dir: string) {
        if (!fs.existsSync(dir)) return;
        const commandFiles = await this.findFiles(`${dir}/*/*{.js,.ts}`);
        for (const filePath of commandFiles) {
            const command = await this.importFile(filePath);
            if (!command?.name) continue;
            this.commands.set(command.name, command);
            this.slashCommands.push(command);
        }
    }

    private async _loadSubcommands(dir: string) {
        if (!fs.existsSync(dir)) return;
        const categoryDirs = await this.findFiles(`${dir}/*`);
        for (const categoryPath of categoryDirs) {
            const categoryName = path.basename(categoryPath);
            const commandFiles = await this.findFiles(`${categoryPath}/*{.js,.ts}`);

            const categoryCommand = {
                name: categoryName,
                description: `Comandos de ${categoryName}.`,
                options: [],
            };

            for (const filePath of commandFiles) {
                const command = await this.importFile(filePath);
                if (!command?.name) continue;

                categoryCommand.options.push({
                    name: command.name,
                    description: command.description,
                    type: ApplicationCommandOptionType.Subcommand,
                    options: command.options,
                });
                this.commands.set(`${categoryName}.${command.name}`, command);
            }
            if(categoryCommand.options.length > 0) this.slashCommands.push(categoryCommand);
        }
    }

    private async _loadSubcommandGroups(dir: string) {
        if (!fs.existsSync(dir)) return;
        const groupDirs = await this.findFiles(`${dir}/*`);

        for (const groupPath of groupDirs) {
            const groupName = path.basename(groupPath);
            const groupCommand = {
                name: groupName,
                description: `Comandos del grupo ${groupName}.`,
                options: [],
            };

            const subcommandDirs = await this.findFiles(`${groupPath}/*`);
            for (const subcommandPath of subcommandDirs) {
                const subcommandName = path.basename(subcommandPath);
                const subcommandGroupOption = {
                    name: subcommandName,
                    description: `Subcomandos de ${subcommandName}.`,
                    type: ApplicationCommandOptionType.SubcommandGroup,
                    options: [],
                };

                const commandFiles = await this.findFiles(`${subcommandPath}/*{.js,.ts}`);
                for (const filePath of commandFiles) {
                    const command = await this.importFile(filePath);
                    if (!command?.name) continue;

                    subcommandGroupOption.options.push({
                        name: command.name,
                        description: command.description,
                        type: ApplicationCommandOptionType.Subcommand,
                        options: command.options,
                    });
                    this.commands.set(`${groupName}.${subcommandName}.${command.name}`, command);
                }
                if (subcommandGroupOption.options.length > 0) {
                    groupCommand.options.push(subcommandGroupOption);
                }
            }
            if (groupCommand.options.length > 0) {
                this.slashCommands.push(groupCommand);
            }
        }
    }
    public async registerCommands() {
        const guildId = process.env.devGuildId; // Usar variables de entorno es mejor práctica

        try {
            console.log("🔄 Registrando comandos globales...","CommandHandler");
            await this.client.application?.commands.set(this.slashCommands);
            console.log("✅ Comandos globales registrados.","CommandHandler");

            if (guildId && this.slashCommandsDev.length > 0) {
                console.log(`🔄 Registrando comandos de desarrollo en el servidor ${guildId}...`,"CommandHandler");
                await this.client.guilds.cache.get(guildId)?.commands.set(this.slashCommandsDev);
                console.log("✅ Comandos de desarrollo registrados.","CommandHandler");
            }
        } catch (error) {
            console.error("❌ Error al registrar comandos:" + ""+error+"","CommandHandler");
        }
    }
}

