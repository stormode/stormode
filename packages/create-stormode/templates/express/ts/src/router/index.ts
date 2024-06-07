import type { Application, Request, Response } from "express";

import { Router } from "express";

const route = (app: Application): void => {
    // declarations
    const router: Router = Router();

    // routing
    router.get("/", async (req: Request, res: Response): Promise<void> => {
        res.status(200).json({
            message: "Hello World",
        });
    });

    app.use("/", router);
};

export default route;
