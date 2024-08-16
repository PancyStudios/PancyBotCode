import { TempbanOptions } from "../Type/Temban";
import { Schema, SchemaTypes, model } from "mongoose";

const TempBanSchema = new Schema<TempbanOptions>({
    ServerId: { type: SchemaTypes.String },
    UserId: { type: SchemaTypes.String },
    Expira: { type: SchemaTypes.Number },
})

export const TempbanModel = model("tempbans", TempBanSchema)