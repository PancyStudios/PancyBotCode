import {
    ChatInputApplicationCommandData,
    CommandInteraction,
    CommandInteractionOptionResolver,
    GuildMember,
    PermissionResolvable,
    UserApplicationCommandData
} from 'discord.js';
import { ExtendedClient } from '../Structure/Client';
import { GuildDataFirst } from '../Database/Type/Security';

/**
 * {
 *  name: 'commandname',
 * description: 'any description',
 * run: async({ interaction }) => {
 *
 * }
 * }
 */

interface RunOptions {
    client: ExtendedClient;
    interaction: CommandInteraction;
    args: CommandInteractionOptionResolver;
    prefix: string;
    guilddb: GuildDataFirst;
}

type RunFunction = (options: RunOptions) => any;

export type CommandType = {
    isDev?: boolean;
    category: string;
    run: RunFunction;
    database?: boolean;

} & UserApplicationCommandData;