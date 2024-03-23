import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

const route = (server: FastifyInstance) => {
    // route
    server.get(
        "/",
        async (
            request: FastifyRequest,
            reply: FastifyReply,
        ): Promise<FastifyReply> => {
            try {
                return reply.code(200).send({
                    status: "success",
                    message: "hello",
                });
            } catch (e: unknown) {
                return reply.code(500).send({
                    status: "error",
                    message: "server",
                });
            }
        },
    );
};

export default route;
