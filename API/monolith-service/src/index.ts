import dotenv from "dotenv";
dotenv.config({ path: [".env"] });

import express from "express";
import type { Express } from "express";
import AppRouter from "@/routes/index.routes";
import AuthRouter from "@/routes/auth.routes";
import AuthController from "@/controllers/auth.controller";
import { AuthService, OAuthService, UserService, EmailService, BookingService, ImageService, FavouriteService } from "@/services";
import { AuthRepository, UserRepository, RoomRepository, BookingRepository, FavouriteRepository, FacilityRepository } from "@/repositories";
import CognitoClient from "@/clients/cognito.client";
import prismaClient from "./clients/prisma.client";

import cors from "cors";
import cookieParser from "cookie-parser";
import UserController from "./controllers/user.controller";
import UserRouter from "./routes/user.routes";
import { connectRedis } from "./clients/redis.client";
import ImageRouter from "./routes/image.routes";
import ImageController from "./controllers/image.controller";
import UploadService from "./services/upload.service";
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
import BookingRouter from "./routes/booking.routes";
import BookingController from "./controllers/booking.controller";
import ReviewRepository from "@/repositories/review.repository";
import ReviewService from "@/services/review.service";
import ReviewController from "@/controllers/review.controller";
import ReviewRouter from "@/routes/review.routes";
import FacilityRouter from "./routes/facility.routes";
import FacilityController from "./controllers/facility.controller";

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
const bookingRepository = new BookingRepository(prismaClient);
const reviewRepository = new ReviewRepository(prismaClient);
const favouriteRepository = new FavouriteRepository(prismaClient);
const facilityRepository = new FacilityRepository(prismaClient);

// Services
const s3Service = new S3Service();
const emailService = new EmailService(s3Service);
const authService = new AuthService({
	cognitoClient: cognitoClient,
	googleClientSecret: process.env.GOOGLE_CLIENT_SECRET!,
	emailService: emailService,
});
const userService = new UserService(userRepository);
const favouriteService = new FavouriteService(favouriteRepository);
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
const imageService = new ImageService(imageRepository, s3Service);
const bookingService = new BookingService(bookingRepository, userService, emailService);
const roomService = new RoomService(roomRepository, bookingService, imageService);
const uploadService = new UploadService(s3Service, imageRepository);
const accommodationService = new AccommodationService(accommodationRepository, roomService, imageService, s3Service);
const reviewService = new ReviewService({
	reviewRepository: reviewRepository,
	userService: userService,
	bookingService: bookingService,
	imageService: imageService,
});
bookingService.setAccommodationService(accommodationService);

// Controllers
const authController = new AuthController(authService, userService, oauthService, authRepository);
const userController = new UserController(userService, favouriteService);
const roomController = new RoomController(roomService);
const imageController = new ImageController(uploadService, imageService);
const accommodationController = new AccommodationController(accommodationService);
const bookingController = new BookingController(bookingService);
const reviewController = new ReviewController(reviewService, reviewRepository);
const facilityController = new FacilityController(facilityRepository);

// Routers
const authRouter = new AuthRouter(express.Router(), authController);
const userRouter = new UserRouter(express.Router(), userController);
const imageRouter = new ImageRouter(express.Router(), imageController, UploadClient.getInstance());
const roomRouter = new RoomRouter(express.Router(), roomController);
const accommodationRouter = new AccommodationRouter(express.Router(), accommodationController);
const bookingRouter = new BookingRouter(express.Router(), bookingController);
const reviewRouter = new ReviewRouter(express.Router(), reviewController);
const facilityRouter = new FacilityRouter(express.Router(), facilityController);
const appRouter = new AppRouter(authRouter, userRouter, imageRouter, roomRouter, accommodationRouter, bookingRouter, reviewRouter, facilityRouter);

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
