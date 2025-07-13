import { Schema, model } from "mongoose";
import { EmbedDb } from "../Type/Embeds";

export const EmbedsSchema = new Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    name: { type: String },
    embed: { type: Object },
    isPublic: { type: Boolean },
    isGlobal: { type: Boolean  },
})

export const Embeds = model<EmbedDb>("embeds", EmbedsSchema)