import {
    ChatInputApplicationCommandData,
    Message,
    PermissionResolvable
} from 'discord.js';
import { ExtendedClient } from '../Structure/Client';
import { GuildDataFirst } from '../Database/Type/Security';

/**
 * {
 *  name: 'commandname',
 * description: 'any description',
 * run: async({ message }) => {
 *
 * }
 * }
 */

interface RunOptions {
    client: ExtendedClient;
    message: Message;
    args: String[] | String[0] | Array<string>;
    prefix: string;
    guilddb: GuildDataFirst;
}

type RunFunction = (options: RunOptions) => any;

export type CommandTypeMsg = {
    aliases?: string[]
    category: string;
    use: string;
    userPermissions?: PermissionResolvable[];
    botPermissions?: PermissionResolvable[];
    inVoiceChannel?: boolean;
    isDev?: boolean;
    run: RunFunction;
    database?: boolean;
} & ChatInputApplicationCommandData;