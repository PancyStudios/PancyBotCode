import { Schema, model, SchemaTypes } from 'mongoose';

export interface LogEntry {
    guildId: string;
    type: string; // 'message_delete', 'member_join', etc.
    content: any; // Flexible content depending on log type
    timestamp: Date;
}

const logsSchema = new Schema<LogEntry>({
    guildId: { type: SchemaTypes.String, required: true, index: true },
    type: { type: SchemaTypes.String, required: true },
    content: { type: SchemaTypes.Mixed, required: true },
    timestamp: { type: SchemaTypes.Date, default: Date.now, index: true }
});

// Index for efficient querying of recent logs per guild
logsSchema.index({ guildId: 1, timestamp: -1 });

export const LogsModel = model<LogEntry>('Logs', logsSchema);
