import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";

import "dotenv";
import ErrorHandler from "./middlewares/ErrorHandler";
import AuthRouterFactory from "./routes/AuthRouterFactory";

export const startRest = () => {
	const app = express();
	app.use(express.json());
	app.use(cookieParser());

	app.use(
		session({
			secret: process.env["SESSION_SECRET"] as string,
			resave: false,
			saveUninitialized: true,
			cookie: { secure: false },
		})
	);

	app.use("/", AuthRouterFactory.createAuthRouter());

	app.use(ErrorHandler.handle);

	const PORT = process.env["PORT"] || 3002;
	app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));
};
