import 'dotenv/config';
import './Utils/Handlers/ErrorHandler/LogSystem'
import {Database} from './Database'
import {ExtendedClient} from './Structure/Client'
import {PancyBotUtils} from './Utils/Functions/BaseUtilsBot'
import {ErrorHandler} from './Utils/Handlers/ErrorHandler/ErrorManageSystem'
import {app} from './Utils/Handlers/Web'

export const errorHandler = new ErrorHandler()
export const client = new ExtendedClient()
export const utils = new PancyBotUtils()
export var Server = app.listen(process.env.PORT, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${process.env.PORT}`);
})
export const database = new Database()

client.start().then(() => {

})

console.log(process.cwd())


