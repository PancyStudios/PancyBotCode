import { Event } from '../../Structure/Events';
import { logs } from '../..';

export default new Event('warn', warn => {
    logs.warn(`[Warn]: ${warn}`)
})