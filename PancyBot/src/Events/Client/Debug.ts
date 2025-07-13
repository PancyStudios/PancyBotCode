import { Event } from '../../Structure/Events';

export default new Event('debug', debug => {
    console.debug(debug)
})