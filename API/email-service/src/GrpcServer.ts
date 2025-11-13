import { Server, ServerCredentials } from "@grpc/grpc-js";
import { EmailServiceService } from "../generated/grpc/email-service/email-service";
import GrpcEmailController from "./controllers/GrpcEmailController";
import SmtpClient from "./clients/SmtpClient";

class GrpcServerFactory {
	public static createGrpcServer() {
		const smtpClient = new SmtpClient();
		const grpcEmailController = new GrpcEmailController(smtpClient);
		return new GrpcServer(grpcEmailController);
	}
}

class GrpcServer {
	private server: Server;

	constructor(private readonly grpcEmailController: GrpcEmailController) {
		this.server = new Server();

		// add handlers directly
		this.server.addService(EmailServiceService, {
			sendMail: this.grpcEmailController.sendMail.bind(this.grpcEmailController),
		});
	}

	public start() {
		this.server.bindAsync("0.0.0.0:50058", ServerCredentials.createInsecure(), (error, port) => {
			if (error) {
				console.error(`gRPC server binding failed: ${error.message}`);
				return;
			}
			console.log(`gRPC server running at http://0.0.0.0:${port}`);
		});
	}
}

export default GrpcServerFactory;
