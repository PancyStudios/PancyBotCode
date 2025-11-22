import { Schema, model, SchemaTypes } from 'mongoose';

export interface MusicSettings {
    guildId: string;
    djRole: string | null;
    defaultVolume: number;
    stayInVc: boolean;
    channelId: string | null;
}

const musicSchema = new Schema<MusicSettings>({
    guildId: { type: SchemaTypes.String, required: true, unique: true },
    djRole: { type: SchemaTypes.String, default: null },
    defaultVolume: { type: SchemaTypes.Number, default: 100 },
    stayInVc: { type: SchemaTypes.Boolean, default: false },
    channelId: { type: SchemaTypes.String, default: null }
});

export const MusicModel = model<MusicSettings>('Music', musicSchema);
