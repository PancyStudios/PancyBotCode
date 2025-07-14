import express, {NextFunction, Request, Response} from "express";
import rateLimit from "express-rate-limit";
import {json, urlencoded} from 'body-parser';
import path from "path";

import {RouterVotos} from '../../../Events/Client/Top.gg';
import {ApiRouter} from "./Routes/Api";
import {PublicView} from "./Routes/Page";

export const app = express();
const PORT = process.env.PORT || 3000;

// =================================================================
// 1. CONFIGURACIÓN INICIAL
// =================================================================
app.set('trust proxy', 2);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'Views'));

// =================================================================
// 2. MIDDLEWARES GENERALES
// =================================================================
app.use(json());
app.use(urlencoded({ extended: true }));

// Servir archivos estáticos bajo el prefijo /public
app.use('/public', express.static(path.join(__dirname, 'public')));

// Tu middleware de logs
function logsServer(req: Request, _: Response, next: NextFunction) {
    console.log(`[LOG] Nueva solicitud: ${req.method} ${req.url}`);
    next();
}
app.use(logsServer);

// Tu rate limiter
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: { error: 'Demasiadas solicitudes, por favor intente de nuevo más tarde.' },
    statusCode: 429,
    headers: true,
});
app.use(limiter);


// =================================================================
// 3. RUTAS DE LA APLICACIÓN
// =================================================================
app.use('/votos', RouterVotos);
app.use('/api', ApiRouter);
app.use('/', PublicView);

// Ruta de prueba para errores 5xx
app.get('/error-test', (req, res, next) => {
    const err = new Error('Fallo en el motor de hiperimpulso. ¡Revisar inyectores!');
    // Pasamos el error al siguiente middleware (el de manejo de errores)
    next(err);
});


// =================================================================
// 4. MANEJO DE ERRORES (¡MUY IMPORTANTE EL ORDEN!)
// =================================================================

// Middleware de manejo de errores 5xx
// Se ejecuta solo si una ruta anterior llama a next(err)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack); // Loguea el error completo para depuración

    const statusCode = err.status || 500;
    const isDevelopment = process.env.NODE_ENV === 'development';

    res.status(statusCode).render('5xx', {
        error: {
            status: statusCode,
            message: isDevelopment ? err.message : "Nuestros sistemas encontraron una anomalía.",
            stack: isDevelopment ? err.stack : null
        }
    });
});

// Middleware de manejo de errores 404 (Atrapa todo)
// Se ejecuta solo si ninguna ruta anterior coincidió
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'Routes', 'Page', 'Views', '404.html'));
});

