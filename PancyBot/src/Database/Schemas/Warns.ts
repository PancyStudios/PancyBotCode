import {model, Schema, SchemaTypes} from "mongoose";
import {WarnsDb} from "../Type/Warns";

export const warnsSchema = new Schema({
    guildId: { type: SchemaTypes.String, required: true },
    userId: { type: SchemaTypes.String, required: true },
    warns: { type: SchemaTypes.Array, required: true }
})

export const warns = model<WarnsDb>('Warns', warnsSchema);