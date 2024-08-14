import { config } from 'dotenv'
config()
import { ExtendedClient } from './Structure/Client'
import { PancyBotUtils } from './Utils/Functions/BaseUtilsBot'
import { ErrorHandler } from './Utils/Handlers/ErrorHandler/ErrorManageSystem'
import { app } from './Utils/Handlers/Web'
import { Client as Craiyon } from 'craiyon'
export const errorHandler = new ErrorHandler()
export const client = new ExtendedClient()
export const utils = new PancyBotUtils()
export const craiyon = new Craiyon()
export var Server = app.listen(process.env.PORT)

client.start()

console.log(process.cwd())


