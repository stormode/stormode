import { FastifyInstance, RouteShorthandOptions } from "fastify";

const useRouter = (server: FastifyInstance) => {
	// router options
	const opts: RouteShorthandOptions = {
		schema: {
			response: {
				200: {
					type: "object",
					properties: {
						message: {
							type: "string",
						},
					},
				},
			},
		},
	};

	// route
	server.get("/", opts, async (request, reply) => {
		return { message: "Hello World" };
	});
};

export default useRouter;
