const { Router } = require("express");

const useRouter = (app) => {
    // declarations
    const router = Router();

    // routing
    router.get("/", (req, res) => {
        res.status(200).json({
            message: "Hello World",
        });
    });

    app.use("/", router);
};

module.exports = useRouter;
