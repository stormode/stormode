import type { FastifyInstance } from "fastify";

const useRouter = (server: FastifyInstance) => {
    // route
    server.get("/", async (request, reply) => {
        return reply.code(200).send({
            message: "Hello World",
        });
    });
};

export default useRouter;
