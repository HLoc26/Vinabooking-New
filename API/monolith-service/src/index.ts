import dotenv from "dotenv";
dotenv.config({ path: [".env"] });

import express from "express";
import type { Express } from "express";
import AppRouter from "@/routes/index.routes";
import AuthRouter from "@/routes/auth.routes";
import AuthController from "@/controllers/auth.controller";
import { AuthService, OAuthService, UserService, EmailService } from "@/services";
import { AuthRepository, UserRepository, RoomRepository } from "@/repositories";
import CognitoClient from "@/clients/cognito.client";
import prismaClient from "./clients/prisma.client";

import cors from "cors";
import cookieParser from "cookie-parser";
import UserController from "./controllers/user.controller";
import UserRouter from "./routes/user.routes";
import { connectRedis } from "./clients/redis.client";
import ImageRouter from "./routes/image.routes";
import ImageController from "./controllers/image.controller";
import { UploadService } from "./services/upload.service";
import S3Service from "./services/s3.service";
import ImageRepository from "./repositories/image.repository";
import UploadClient from "./clients/upload.client";
import { ErrorHandler } from "./utils/response";
import AccommodationRouter from "./routes/accommodation.routes";
import AccommodationController from "./controllers/accommodation.controller";
import AccommodationRepository from "./repositories/accommodation.repository";
import AccommodationService from "./services/accommodation.service";
import RoomRouter from "./routes/room.routes";
import RoomController from "./controllers/room.controller";
import RoomService from "./services/room.service";

const app: Express = express();
connectRedis();

// Clients
const cognitoClient = CognitoClient.getInstance();

// Repositories
const authRepository = new AuthRepository(prismaClient);
const userRepository = new UserRepository(prismaClient);
const roomRepository = new RoomRepository(prismaClient);
const imageRepository = new ImageRepository(prismaClient);
const accommodationRepository = new AccommodationRepository(prismaClient);

// Services
const emailService = new EmailService();
const authService = new AuthService({
	cognitoClient: cognitoClient,
	googleClientSecret: process.env.GOOGLE_CLIENT_SECRET!,
	emailService: emailService,
});
const userService = new UserService(userRepository);
const oauthService = new OAuthService(
	{
		googleClientId: process.env["GOOGLE_CLIENT_ID"]!,
		clientSecret: process.env["GOOGLE_CLIENT_SECRET"]!,
		redirectUri: process.env["GOOGLE_REDIRECT_URI"]!,
	},
	userService,
	authService,
	authRepository,
	userRepository
);
const roomService = new RoomService(roomRepository);
const s3Service = new S3Service();
const uploadService = new UploadService(s3Service, imageRepository);
const accommodationService = new AccommodationService(accommodationRepository);

// Controllers
const authController = new AuthController(authService, userService, oauthService, authRepository);
const userController = new UserController(userService);
const roomController = new RoomController(roomService);
const imageController = new ImageController(uploadService, s3Service, imageRepository);
const accommodationController = new AccommodationController(accommodationService);

// Routers
const authRouter = new AuthRouter(express.Router(), authController);
const userRouter = new UserRouter(express.Router(), userController);
const imageRouter = new ImageRouter(express.Router(), imageController, UploadClient.getInstance());
const roomRouter = new RoomRouter(express.Router(), roomController);
const accommodationRouter = new AccommodationRouter(express.Router(), accommodationController);
const appRouter = new AppRouter(authRouter, userRouter, imageRouter, roomRouter, accommodationRouter);

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

app.use(ErrorHandler.handle);

app.listen(8080, () => {
	console.log("Listening on port 8080");
});
