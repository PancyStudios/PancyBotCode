import { Event } from "../../Structure/Events";
import { exec, spawn } from 'child_process';

export default new Event('ready', async (_) => {
    exec('git add .')
    exec('git commit -m "Local Changes"')
    const installProcess = spawn(`npm playwright install`)
    installProcess.on('message', (message) => { 
        console.log(message, 'PLAYWRIGHT INSTALL')
    })
    installProcess.on('error', (error) => {
        console.log(error, 'PLAYWRIGHT INSTALL ERROR')
    })
    installProcess.on('close', (code) => {
        console.log(code, 'PLAYWRIGHT INSTALL CLOSE')
    })
    installProcess.on('exit', (code) => {
        console.log(code, 'PLAYWRIGHT INSTALL EXIT')
    })
    installProcess.on('disconnect', () => {
        console.log('PLAYWRIGHT INSTALL DISCONNECT')
    })
    setInterval(() =>{
        exec('git pull origin update --no-rebase', async (err, stdout, stderr) => {})
    }, 1000 * 60)
})