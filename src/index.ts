import { config } from 'dotenv'
config()
import { ExtendedClient } from './Structure/Client'
import { PancyBotUtils } from './Utils/Functions/BaseUtilsBot'
import { ErrorHandler } from './Utils/Handlers/ErrorHandler/ErrorManageSystem'
import { Logs } from './Utils/Handlers/ErrorHandler/LogSystem'
import { app } from './Utils/Handlers/Web'
import { Client as Craiyon } from 'craiyon'
import { connect } from 'mongoose'

export const logs = new Logs()
export const errorHandler = new ErrorHandler()
export const client = new ExtendedClient()
export const utils = new PancyBotUtils()
export const craiyon = new Craiyon()
export var Server = app.listen(process.env.PORT)

client.start()

export const db = connect(process.env.mongodbUrl, {
    dbName: 'PancyBot',
    appName: "Cluster0",
    retryWrites: true,  
}).then(x => {
    logs.warn('Conectando a la base de datos')
}).catch(x => {
    logs.error(x)
}).finally(() => logs.info('Conectado a la base de datos'))

logs.log(process.cwd())

