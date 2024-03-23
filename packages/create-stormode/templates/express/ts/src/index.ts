import type { Application } from "express";

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import route from "#/router";

(async (): Promise<void> => {
    try {
        const app: Application = express();
        const port: number = Number(process.env.PORT);

        // CORS options
        const corsOptions = {
            origin: true,
            credentials: true,
            "Access-Control-Allow-Credentials": true,
            "Access-Control-Allow-Headers": "Set-Cookie",
            "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE",
        };

        // CORS polices
        app.use(cors(corsOptions));

        // read cookies
        app.use(cookieParser());

        // content-type: application/json
        app.use(express.json());

        // content-type: application/x-www-form-urlencoded
        app.use(express.urlencoded({ extended: true }));

        // use router
        route(app);

        // listening
        app.listen(port, (): void => {
            const msg: string = `Server running on: http://0.0.0.0:${port}`;
            console.log("- [\x1b[38;5;10mready\x1b[0m]", msg);
        });
    } catch (e: unknown) {
        console.error(e instanceof Error ? e.message : String(e));
        process.exit(1);
    }
})();
