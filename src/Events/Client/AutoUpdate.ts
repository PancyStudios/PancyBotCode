import { Event } from "../../Structure/Events";
import { exec } from 'child_process';

export default new Event('ready', async (_) => {
    setInterval(() =>{
        exec('git pull origin update --no-rebase', async (err, stdout, stderr) => {
            if (err) {
                console.error(err)
                return
            }
            if (stderr) {
                console.error(stderr)
                return
            }
            console.info(stdout);
        })
    }, 3000)
})