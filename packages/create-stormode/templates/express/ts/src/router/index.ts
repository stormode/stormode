import { Application, Router, Request, Response } from "express";

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
