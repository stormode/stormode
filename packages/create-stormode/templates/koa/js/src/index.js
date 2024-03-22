const Koa = require("koa");

const router = require("./router");

const app = new Koa();
const port = Number(process.env.PORT);

app.use(router.routes());

app.listen(port, () => {
    const msg = `Server running on: http://0.0.0.0:${port}`;
    console.log("- [\x1b[38;5;10mready\x1b[0m]", msg);
});
