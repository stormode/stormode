import type { Application, Request, Response } from "express";

import { Router } from "express";

const useRouter = (app: Application): void => {
	// declarations
	const router: Router = Router();

	// routing
	router.get("/", (req: Request, res: Response) => {
		res.status(200).json({
			message: "Hello World",
		});
	});

	app.use("/", router);
};

export default useRouter;
