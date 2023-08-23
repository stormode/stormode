const useRouter = require("./router");

const isPrd = process.env.NODE_ENV === "production";
const fastify = require("fastify")({ logger: !isPrd });
const port = Number(process.env.PORT);

// use router
useRouter(fastify);

// listener
fastify.listen({ port: port }, (err) => {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
	const msg = `Server running on: http://0.0.0.0:${port}`;
	console.log(`- [\x1b[38;5;10mready\x1b[0m]`, msg);
});
