import { Event } from '../../Structure/Events';

export default new Event('error', err => {
    console.error(err)
})