const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const useRouter = require("./router");

const app = express();
const port = Number(process.env.PORT);

// CORS options
const corsOptions = {
	origin: true,
	credentials: true,
	"Access-Control-Allow-Credentials": true,
	"Access-Control-Allow-Headers": "Set-Cookie",
	"Access-Control-Allow-Methods": "POST, GET, PUT, DELETE",
};

// CORS polices
app.use(cors(corsOptions));

// read cookies
app.use(cookieParser());

// content-type: application/json
app.use(express.json());

// content-type: application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// use router
useRouter(app);

// listening
app.listen(port, () => {
	const msg = `Server running on: http://0.0.0.0:${port}`;
	console.log(`- [\x1b[38;5;10mready\x1b[0m]`, msg);
});
