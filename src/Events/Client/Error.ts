import { Event } from '../../Structure/Events';
import { logs } from '../..';

export default new Event('error', err => {
    logs.error(`[Error]: ${err}`)
})