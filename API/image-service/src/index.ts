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
import GrpcImageController from "./controllers/gRPCImageController";
import { UploadService } from "./services/UploadService";
import S3Service from "./services/S3Service";
import ImageRepository from "./repositories/ImageRepository";
const server = new Server();

const grpcImageController = new GrpcImageController(new UploadService(new S3Service(), new ImageRepository()));

server.addService(ImageServiceService, {
    getHealth: grpcImageController.getHealth,
    uploadImages: grpcImageController.uploadImages.bind(grpcImageController),
});

server.bindAsync("0.0.0.0:50057", ServerCredentials.createInsecure(), (error, port) => {
    if (error) {
        console.error(`Server binding failed: ${error.message}`);
        return;
    }
    console.log(`Server running at http://0.0.0.0:${port}`);
    // server.start()
});
