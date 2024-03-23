const route = (server) => {
    // route
    server.get("/", async (request, reply) => {
        try {
            return reply.code(200).send({
                status: "success",
                message: "hello",
            });
        } catch (e) {
            return reply.code(500).send({
                status: "error",
                message: "server",
            });
        }
    });
};

module.exports = route;
