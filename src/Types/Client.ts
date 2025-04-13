import { ApplicationCommandDataResolvable } from "discord.js";

export interface RegisterCommandsOptions {
    guildId?: string;
    userId?: string;
    commands: ApplicationCommandDataResolvable[];
}
