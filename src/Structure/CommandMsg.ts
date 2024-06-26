import { CommandTypeMsg } from "../Types/CommandMsg"; 

export class Command {
    constructor(commandOptions: CommandTypeMsg) {
        Object.assign(this, commandOptions);
    }
}
