import { sendUnaryData, ServerErrorResponse, ServerUnaryCall, StatusObject } from "@grpc/grpc-js";
import { HealthResponse, VerifyRequest, VerifyResponse } from "../../generated/grpc/auth-service/auth-service";
import { Empty } from "../../generated/grpc/auth-service/google/protobuf/empty";
import MappingUtil from "../utils/MappingUtil";
import { ETokenType } from "../types/Request";
import JwtService from "../services/JwtService";
import BadRequestError from "../errors/BadRequestError";

class GrpcAuthController {
    getHealth(_call: ServerUnaryCall<Empty, HealthResponse>, callback: sendUnaryData<HealthResponse>) {
        const health: HealthResponse = {
            service: "Auth Service",
            success: true,
        };

        callback(null, health);
    }

    async verifyToken(call: ServerUnaryCall<VerifyRequest, VerifyResponse>, callback: sendUnaryData<VerifyResponse>) {
        try {
            const { token, tokenType } = call.request;

            const type = MappingUtil.tokenTypeMapping(tokenType);

            let payload;
            switch (type) {
                case ETokenType.ACCESS:
                    payload = await JwtService.verifyAccessToken(token);
                    break;
                case ETokenType.ID:
                    payload = await JwtService.verifyIdToken(token);
                    break;
                default:
                    throw new BadRequestError(`Invalid token type: ${tokenType}`);
            }

            if (!payload) {
                throw new Error("Empty payload");
            }

            const username = (type === ETokenType.ACCESS ? payload.username : payload["cognito:username"]) as string;

            const userInfo = {
                id: payload.sub,
                username: username,
            };

            callback(null, { user: userInfo });
        } catch (error) {
            console.error(error);
            callback(error as Partial<StatusObject> | ServerErrorResponse, null);
        }
    }
}

export default GrpcAuthController;
