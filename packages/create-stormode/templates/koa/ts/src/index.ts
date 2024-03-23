import Koa from "koa";

import router from "#/router";

(async (): Promise<void> => {
    try {
        const app: Koa = new Koa();
        const port: number = Number(process.env.PORT);

        app.use(router.routes());

        app.listen(port, (): void => {
            const msg: string = `Server running on: http://0.0.0.0:${port}`;
            console.log("- [\x1b[38;5;10mready\x1b[0m]", msg);
        });
    } catch (e: unknown) {
        console.error(e instanceof Error ? e.message : String(e));
        process.exit(1);
    }
})();
