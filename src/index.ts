import { config } from 'dotenv'
config()
import '../src/Utils/Handlers/ErrorHandler/LogSystem'
import { Database } from './Database'
import { ExtendedClient } from './Structure/Client'
import { PancyBotUtils } from './Utils/Functions/BaseUtilsBot'
import { ErrorHandler } from './Utils/Handlers/ErrorHandler/ErrorManageSystem'
import { app } from './Utils/Handlers/Web'
export const errorHandler = new ErrorHandler()
export const client = new ExtendedClient()
export const utils = new PancyBotUtils()
export var Server = app.listen(process.env.PORT, () => {
    process.env.PORT ? console.log(`Server running on port ${process.env.PORT}`) : console.log('Server running on port 3000')
})
export const database = new Database()

client.start()

console.log(process.cwd())


