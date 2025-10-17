import { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
import { Empty } from "../../generated/grpc/google/protobuf/empty";
import { HealthResponse } from "../../generated/grpc/image-service";

export const getHealthHandler = (_call: ServerUnaryCall<Empty, HealthResponse>, callback: sendUnaryData<HealthResponse>) => {
    const health: HealthResponse = {
        service: "Image Service",
        success: true,
    };

    callback(null, health);
};
