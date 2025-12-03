import { Server, ServerCredentials } from "@grpc/grpc-js";
import { AuthServiceService } from "../generated/grpc/auth-service/auth-service";
import GrpcAuthController from "./controllers/GrpcAuthController";

export const startGrpc = () => {
	const server = new Server();

	const grpcAuthController = new GrpcAuthController();

	server.addService(AuthServiceService, {
		getHealth: grpcAuthController.getHealth,
		verifyToken: grpcAuthController.verifyToken,
	});

	server.bindAsync("0.0.0.0:50052", ServerCredentials.createInsecure(), (error, port) => {
		if (error) {
			console.error(`gRPC server binding failed: ${error.message}`);
			return;
		}
		console.log(`gRPC server running at http://0.0.0.0:${port}`);
		// server.start()
	});
};
