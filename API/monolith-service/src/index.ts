import dotenv from "dotenv";
dotenv.config({ path: [".env"] });

import express from "express";
import type { Express } from "express";
import AppRouter from "@/routes/index.routes";
import AuthRouter from "@/routes/auth.routes";
import AuthController from "@/controllers/auth.controller";
import { AuthService, OAuthService, UserService } from "@/services";
import { AuthRepository, UserRepository } from "@/repositories";
import CognitoClient from "@/clients/cognito.client";
import prismaClient from "./clients/prisma.client";

import cors from "cors";
import cookieParser from "cookie-parser";
import UserController from "./controllers/user.controller";
import UserRouter from "./routes/user.routes";

const app: Express = express();

// Clients
const cognitoClient = CognitoClient.getInstance();

// Repositories
const authRepository = new AuthRepository(prismaClient);
const userRepository = new UserRepository(prismaClient);

// Services
const authService = new AuthService({
	cognitoClient: cognitoClient,
	googleClientSecret: process.env.GOOGLE_CLIENT_SECRET!,
});
const userService = new UserService(userRepository);
const oauthService = new OAuthService(
	{
		googleClientId: process.env.GOOGLE_CLIENT_ID!,
		clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		redirectUri: process.env.GOOGLE_REDIRECT_URI!,
	},
	userService,
	authService,
	authRepository,
	userRepository
);

// Controllers
const authController = new AuthController(authService, userService, oauthService, authRepository);
const userController = new UserController(userService);

// Routers
const authRouter = new AuthRouter(express.Router(), authController);
const userRouter = new UserRouter(express.Router(), userController);
const appRouter = new AppRouter(authRouter, userRouter);

const allowed = ["http://localhost:5173", "https://d3o4csdzy9h0t1.cloudfront.net"];

app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin || allowed.includes(origin)) {
				return callback(null, true);
			}
			return callback(new Error("Not allowed by CORS"));
		},
		credentials: true,
	})
);

app.use(cookieParser());
app.use(express.json());

app.use((req, res, next) => {
	console.log(`Incoming request: ${req.method} ${req.url}`);
	next();
});

app.use(appRouter.router);

app.listen(8080, () => {
	console.log("Listening on port 8080");
});
