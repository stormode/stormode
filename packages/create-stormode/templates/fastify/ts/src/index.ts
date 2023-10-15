import Fastify, { FastifyInstance } from "fastify";

import useRouter from "./router";

const isDev: boolean = process.env.NODE_ENV === "development";

const server: FastifyInstance = Fastify({
    logger: isDev,
});
const port: number = Number(process.env.PORT ?? 4001);

// use router
useRouter(server);

// listener
const start = async () => {
    try {
        await server.listen({ port: port });
        const msg = `Server running on: http://0.0.0.0:${port}`;
        console.log(`- [\x1b[38;5;10mready\x1b[0m]`, msg);
    } catch (err: unknown) {
        console.error(err instanceof Error ? err.message : "Error");
        process.exit(1);
    }
};

start();
