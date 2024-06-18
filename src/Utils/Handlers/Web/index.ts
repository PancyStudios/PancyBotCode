import express, { Express } from "express";
import { json, urlencoded } from 'body-parser';
import { RouterVotos } from '../../../Events/Client/Top.gg'
import { StatusRouter } from "./Routes/Status";
import { ApiRouter } from "./Routes/Api";
import { config } from "dotenv";

config()

export const app = express()

app.use(json());
app.use(urlencoded({ extended: true }));
app.use('/votos', RouterVotos);
app.use('/status', StatusRouter);
app.use('/api', ApiRouter);



