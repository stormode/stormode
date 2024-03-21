const fastify = require("fastify");

const useRouter = require("./router");

const isDev = process.env.NODE_ENV === "development";

const server = fastify({ logger: isDev });
const port = Number(process.env.PORT);

// use router
useRouter(server);

// listener
server.listen({ port: port }, (e) => {
    if (e) {
        console.error(e instanceof Error ? e.message : "Error");
        process.exit(1);
    }
    const msg = `Server running on: http://0.0.0.0:${port}`;
    console.log(`- [\x1b[38;5;10mready\x1b[0m]`, msg);
});
