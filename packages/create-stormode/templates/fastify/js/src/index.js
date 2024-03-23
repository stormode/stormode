const fastify = require("fastify");

const route = require("./router");

// listener
(async () => {
    try {
        const server = fastify();
        const port = Number(process.env.PORT ?? 4001);

        // use router
        route(server);

        await server.listen({ port: port });

        const msg = `Server running on: http://0.0.0.0:${port}`;
        console.log("- [\x1b[38;5;10mready\x1b[0m]", msg);
    } catch (e) {
        console.error(e instanceof Error ? e.message : String(e));
        process.exit(1);
    }
})();
