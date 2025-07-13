import { Router } from "express";
import { client, database } from "../../../../../index";
import { version } from "../../../../../../../package.json";
export var PublicView = Router();
import path from 'path'

PublicView.get("/ToS", (_, res) => {
    switch(process.env.enviroment) {
        case "dev":
            res.sendFile(path.join(__dirname, '.', 'Views', 'ToS.Canary.html'))
            break;
        default:
            res.sendFile(path.join(__dirname, '..', 'Views', 'ToS.html'));
            break;
    }
})