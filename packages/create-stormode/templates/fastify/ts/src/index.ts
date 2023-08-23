import Fastify, { FastifyInstance } from "fastify";

import useRouter from "./router";

const isPrd: boolean = process.env.NODE_ENV === "production";
const server: FastifyInstance = Fastify({
    logger: !isPrd,
});
const port: number = Number(process.env.PORT);

// use router
useRouter(server);

// listener
const start = async () => {
    try {
        await server.listen({ port: port });
        const msg = `Server running on: http://0.0.0.0:${port}`;
        console.log(`- [\x1b[38;5;10mready\x1b[0m]`, msg);
    } catch (err: any) {
        server.log.error(err.message);
        process.exit(1);
    }
};

start();
