import {Router} from "express";
import path from 'path'

export var PublicView = Router();

PublicView.get("/ToS", (_, res) => {
    switch(process.env.enviroment) {
        case "dev":
            res.sendFile(path.join(__dirname, '.', 'Views', 'ToS.Canary.html'))
            break;
        default:
            res.sendFile(path.join(__dirname, '.', 'Views', 'ToS.html'));
            break;
    }
})