import Router from "koa-router";

const router: Router = new Router();

router.get("/", async (ctx) => {
	ctx.body = {
		message: "Hello World",
	};
});

export default router;
