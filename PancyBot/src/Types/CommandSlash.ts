import {
    ChatInputApplicationCommandData,
    ChatInputCommandInteraction,
    CommandInteractionOptionResolver,
    GuildMember,
    PermissionResolvable
} from 'discord.js';
import {ExtendedClient} from '../Structure/Client';

/**
 * {
 *  name: 'commandname',
 * description: 'any description',
 * run: async({ interaction }) => {
 *
 * }
 * }
 */
export interface ExtendedInteraction extends ChatInputCommandInteraction {
    member: GuildMember;
}

interface RunOptions {
    client: ExtendedClient;
    interaction: ExtendedInteraction;
    args: CommandInteractionOptionResolver;
}

type RunFunction = (options: RunOptions) => any;

export type CommandType = {
    userPermissions?: PermissionResolvable[];
    botPermissions?: PermissionResolvable[];
    isDev?: boolean;
    inVoiceChannel?: boolean;
    category: string;
    run: RunFunction;
    database?: boolean;

} & ChatInputApplicationCommandData;