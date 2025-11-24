import {logger} from './Logger';
import util from 'util';

// Guarda las funciones originales por si acaso
const original = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
};

// Función para formatear múltiples argumentos en un solo string
function formatArgs(args: any[]): string {
    return args.map(arg => typeof arg === 'string' ? arg : util.inspect(arg, { depth: null })).join(' ');
}

console.log = (message: any, prefix: string = 'SYS') => {
    logger.info(message, { prefix });
};

console.info = (message: any, prefix: string = 'SYS') => {
    logger.info(message, { prefix });
};

console.warn = (message: any, prefix: string = 'SYS') => {
    logger.warn(message, { prefix });
};

console.error = (error: Error, prefix: string = 'SYS') => {
    // Winston maneja el stack trace automáticamente cuando le pasas un objeto Error
    logger.error(error.message, { prefix, stack: error.stack });
};

console.debug = (message: any, prefix: string = 'SYS') => {
    logger.debug(message, { prefix });
};

console.success = (message: any, prefix: string = 'SYS') => {
    (logger as any).success(message, { prefix });
};

console.critical = (message: any, prefix: string = 'SYS') => {
    (logger as any).critical(message, { prefix });
};

console.system = (message: any, prefix: string = 'SYS') => {
    (logger as any).system(message, { prefix });
};

// Exportamos las originales por si se necesitan
export const originalConsole = original;