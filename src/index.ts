import { ExtendedClient } from './Structures/Client'
import { ErrorHandler } from './Utils/Handlers/ErrorHandler/ErrorManageSystem'
import { Logs } from './Utils/Handlers/ErrorHandler/LogSystem'



export const logs = new Logs()
export const errorHandler = new ErrorHandler()
export const client = new ExtendedClient()
