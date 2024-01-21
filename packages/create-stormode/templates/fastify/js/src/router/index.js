const useRouter = (fastify) => {
    // route
    fastify.get("/", async (request, reply) => {
        return reply.code(200).send({
            message: "Hello World",
        });
    });
};

module.exports = useRouter;
