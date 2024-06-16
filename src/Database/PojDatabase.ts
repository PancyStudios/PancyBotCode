import { Poj } from "./Types/Poj";
import { model, Schema, SchemaTypes } from "mongoose";

const SchemaPoj = new Schema({
    guildId: { type: SchemaTypes.String, required: true },
    channels: { type: SchemaTypes.Array },
})

export const PojDB = model<Poj>('pojDB', SchemaPoj)
