import { Event } from "../../Structures/Events";
import { logs } from "../..";

export default new Event("error", err => {
    logs.error(`[Error]: ${err}`)
})