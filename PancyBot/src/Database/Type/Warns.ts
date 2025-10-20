
export type Warns = {
    reason: string
    moderator: string
    id: string, timestamp: number
}

export type WarnsDb = {
    guildId: string
    userId: string
    warns: Warns[]
}
