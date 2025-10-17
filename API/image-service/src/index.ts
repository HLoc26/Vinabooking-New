import express from "express";
import ImageRouter from "./routes/ImageRouter";
import ErrorHandler from "./middlewares/ErrorHandler";
import { setupSwagger } from "./configs/swagger";

const restApp = express();
restApp.use(express.json());

// Base route: /image

setupSwagger(restApp);

restApp.use(new ImageRouter().router);

restApp.use(ErrorHandler.handle);

const PORT = process.env["PORT"] || 3007;
restApp.listen(PORT, () => console.log(`Image Service running on port ${PORT}`));

// ============================================================================================== //

import { Server, ServerCredentials } from "@grpc/grpc-js";
import { ImageServiceService } from "../generated/grpc/image-service";
import { getHealthHandler } from "./handlers/getHealthHandler";
const server = new Server();

server.addService(ImageServiceService, {
    getHealth: getHealthHandler,
});

server.bindAsync("0.0.0.0:50057", ServerCredentials.createInsecure(), (error, port) => {
    if (error) {
        console.error(`Server binding failed: ${error.message}`);
        return;
    }
    console.log(`Server running at http://0.0.0.0:${port}`);
    // server.start()
});
