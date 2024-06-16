import { Event } from "../../Structures/Events";
import { logs } from "../..";

export default new Event("warn", warn => {
    logs.warn(`[Warn]: ${warn}`)
})