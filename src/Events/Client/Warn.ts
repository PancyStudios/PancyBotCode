import { Event } from '../../Structure/Events';

export default new Event('warn', warn => {
    console.warn(warn)
})