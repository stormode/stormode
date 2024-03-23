import type { FastifyInstance } from "fastify";

import Fastify from "fastify";

import route from "#/router";

// listener
(async (): Promise<void> => {
    try {
        const server: FastifyInstance = Fastify();
        const port: number = Number(process.env.PORT ?? 4001);

        // use router
        route(server);

        await server.listen({ port: port });

        const msg: string = `Server running on: http://0.0.0.0:${port}`;
        console.log("- [\x1b[38;5;10mready\x1b[0m]", msg);
    } catch (e: unknown) {
        console.error(e instanceof Error ? e.message : String(e));
        process.exit(1);
    }
})();
