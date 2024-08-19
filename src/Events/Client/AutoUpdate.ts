import { Event } from "../../Structure/Events";
import { exec } from 'child_process';

export default new Event('ready', async (_) => {
    exec('git add .')
    exec('git commit -m "Local Changes"')
    setInterval(() =>{
        exec('git pull origin update --no-rebase', async (err, stdout, stderr) => {})
    }, 1000 * 60)
})