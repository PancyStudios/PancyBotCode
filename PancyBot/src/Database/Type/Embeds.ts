import { APIEmbed } from "discord.js";

export type EmbedDb = {
    userId: string,
    guildId: string,
    name: string,
    embed: APIEmbed,
    isPublic: boolean,
    isGlobal: boolean,
}