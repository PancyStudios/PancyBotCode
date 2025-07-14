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

    public async loadCommands() {
        console.log("[CommandHandler] ✅ Iniciando carga de comandos...");
        const commandsPath = path.join(process.cwd(), 'PancyBot', 'src', 'commands');

        // Estructura simplificada para manejar los tipos de comandos
        const commandTypes = ['Users', 'Guilds'];

        for (const type of commandTypes) {
            const dirPath = path.join(commandsPath, type);
            await this._loadSimpleCommands(path.join(dirPath, 'commands'));
            await this._loadSubcommands(path.join(dirPath, 'subcommands'));
            await this._loadSubcommandGroups(path.join(dirPath, 'subcommandsgroup'));
        }
        console.log(`[CommandHandler] ✅ Comandos cargados: ${this.commands.size}`);
    }

    private async _loadSimpleCommands(dir: string) {
        const commandFiles = await glob(`${dir}/*/*{.js,.ts}`);
        for (const filePath of commandFiles) {
            const command = await this.importFile(filePath);
            if (!command?.name) continue;
            console.debug(`[CommandHandler] ${command.name}: ${command.description}`);
            this.commands.set(command.name, command);
            this.slashCommands.push(command);
        }
    }

    private async _loadSubcommands(dir: string) {
        const categoryDirs = await glob(`${dir}/*`);
        for (const categoryPath of categoryDirs) {
            const categoryName = path.basename(categoryPath);
            const commandFiles = await glob(`${categoryPath}/*{.js,.ts}`);

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

                console.debug(`[CommandHandler] ${categoryName}.${command.name}: ${command.description}`);
            }
            if(categoryCommand.options.length > 0) this.slashCommands.push(categoryCommand);
        }
    }

    private async _loadSubcommandGroups(dir: string) {
        // Lógica similar a _loadSubcommands pero con un nivel extra de anidación
        // Esta es una implementación simplificada para mantener la claridad
        console.log(`[CommandHandler] ℹ️ La carga de grupos de subcomandos desde '${dir}' debe implementarse.`);
    }

    public async registerCommands() {
        const guildId = process.env.devGuildId; // Usar variables de entorno es mejor práctica

        try {
            console.log("[CommandHandler] 🔄 Registrando comandos globales...");
            await this.client.application?.commands.set(this.slashCommands);
            console.log("[CommandHandler] ✅ Comandos globales registrados.");

            if (guildId && this.slashCommandsDev.length > 0) {
                console.log(`[CommandHandler] 🔄 Registrando comandos de desarrollo en el servidor ${guildId}...`);
                await this.client.guilds.cache.get(guildId)?.commands.set(this.slashCommandsDev);
                console.log("[CommandHandler] ✅ Comandos de desarrollo registrados.");
            }
        } catch (error) {
            console.error("[CommandHandler] ❌ Error al registrar comandos:", error);
        }
    }
}

