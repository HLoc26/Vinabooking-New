import { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
import { HealthResponse } from "../../generated/grpc/auth-service/auth-service";
import { Empty } from "../../generated/grpc/auth-service/google/protobuf/empty";

class GrpcAuthController {
    getHealth(_call: ServerUnaryCall<Empty, HealthResponse>, callback: sendUnaryData<HealthResponse>) {
        const health: HealthResponse = {
            service: "Auth Service",
            success: true,
        };

        callback(null, health);
    }
}

export default GrpcAuthController;
