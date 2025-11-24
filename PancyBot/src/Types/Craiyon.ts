import { DateExpression } from "mongoose";

export type CraiyonResponse = {
    ids: string[];
    images: `${number}-${number}-${number}/${string}`[]
}