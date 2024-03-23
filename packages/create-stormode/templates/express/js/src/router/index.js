const { Router } = require("express");

const route = (app) => {
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

module.exports = route;
