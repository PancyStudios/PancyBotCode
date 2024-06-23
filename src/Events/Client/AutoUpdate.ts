import { Event } from "../../Structure/Events";
import { exec } from 'child_process';
import { logs } from "../..";

export default new Event('ready', async (_) => {
    setTimeout(() =>{
        exec('git pull', async (err, stdout, stderr) => {
            if (err) {
                logs.error(err as unknown as string)
                return
            }
            if (stderr) {
                logs.error(stderr)
                return
            }
            logs.info(stdout);
        })
    }, 3000)
})