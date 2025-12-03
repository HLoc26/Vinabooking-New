import dotenv from "dotenv";
dotenv.config({ path: ["../common.env", ".env"] });
import express from "express";
import ErrorHandler from "./middlewares/ErrorHandler";
import { setupSwagger } from "./configs/swagger";
import ImageRouterFactory from "./routes/ImageRouter";

const restApp = express();
restApp.use(express.json());

setupSwagger(restApp);

// Base route: /image
restApp.use(ImageRouterFactory.createImageRouter());

restApp.use(ErrorHandler.handle);

const PORT = process.env["PORT"] || 3007;
restApp.listen(PORT, () => console.log(`Image Service running on port ${PORT}`));

// ============================================================================================== //

import { Server, ServerCredentials } from "@grpc/grpc-js";
import { ImageServiceService } from "../generated/grpc/image-service/image-service";
import { GrpcImageControllerFactory } from "./controllers/gRPCImageController";
const server = new Server();

const grpcImageController = GrpcImageControllerFactory.createGrpcController();

server.addService(ImageServiceService, {
	getHealth: grpcImageController.getHealth,
	uploadImages: grpcImageController.uploadImages.bind(grpcImageController),
	getImages: grpcImageController.getImages.bind(grpcImageController),
});

server.bindAsync("0.0.0.0:50057", ServerCredentials.createInsecure(), (error, port) => {
	if (error) {
		console.error(`Server binding failed: ${error.message}`);
		return;
	}
	console.log(`Server running at http://0.0.0.0:${port}`);
	// server.start()
});
