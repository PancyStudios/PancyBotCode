import {
    AutocompleteInteraction,
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

interface AutocompleteOptions {
    client: ExtendedClient;
    interaction: AutocompleteInteraction;
}

type RunFunction = (options: RunOptions) => any;
type AutocompleteFunction = (options: AutocompleteOptions) => void;

export type CommandType = {
    userPermissions?: PermissionResolvable[];
    botPermissions?: PermissionResolvable[];
    isDev?: boolean;
    inVoiceChannel?: boolean;
    category: string;
    run: RunFunction;
    auto?: AutocompleteFunction;
    database?: boolean;

} & ChatInputApplicationCommandData;