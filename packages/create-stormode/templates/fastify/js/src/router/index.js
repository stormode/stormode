const useRouter = (app) => {
    // route
	app.get("/", (request, reply) => {
		reply.send({ message: "Hello World" });
	});
};

module.exports = useRouter;
