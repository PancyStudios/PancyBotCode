
export type Warns = {
    reason: string
    moderator: string
    id: string
}

export type WarnsDb = {
    guildId: string
    userId: string
    warns: Warns[]
}
