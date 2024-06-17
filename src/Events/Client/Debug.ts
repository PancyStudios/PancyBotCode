import { Event } from '../../Structure/Events';
import { logs } from '../..';

export default new Event('debug', debug => {
    logs.debug(`[Debug]: ${debug}`)
})