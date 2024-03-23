import type { RouterContext } from "koa-router";

import Router from "koa-router";

const router: Router = new Router();

router.get("/", async (ctx: RouterContext): Promise<void> => {
    ctx.body = {
        message: "Hello World",
    };
});

export default router;
