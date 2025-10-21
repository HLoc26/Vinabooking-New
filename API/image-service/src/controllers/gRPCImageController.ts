import { sendUnaryData, ServerErrorResponse, ServerUnaryCall, StatusObject } from "@grpc/grpc-js";
import { Empty } from "../../generated/grpc/image-service/google/protobuf/empty";
import { HealthResponse, UploadedImage, UploadRequest, UploadResponse } from "../../generated/grpc/image-service/image-service";
import { UploadService } from "../services/UploadService";
import { FileType } from "../types/Image";
import { Readable } from "stream";

class GrpcImageController {
    constructor(private readonly uploadService: UploadService) {}

    getHealth(_call: ServerUnaryCall<Empty, HealthResponse>, callback: sendUnaryData<HealthResponse>) {
        const health: HealthResponse = {
            service: "Image Service",
            success: true,
        };

        callback(null, health);
    }

    async uploadImages(call: ServerUnaryCall<UploadRequest, UploadResponse>, callback: sendUnaryData<UploadResponse>) {
        try {
            const { entityId, entityType, files } = call.request;
            const filesList: FileType[] = files.map((f) => ({
                fieldname: f.filename,
                originalname: f.filename,
                encoding: "",
                mimetype: f.mimeType,
                size: Number(f.data.length),
                stream: new Readable(),
                destination: "",
                filename: f.filename,
                path: "",
                buffer: Buffer.from(f.data),
            }));

            const result: UploadedImage[] = await this.uploadService.handleUploadByEntity(entityType, entityId, filesList);
            const response: UploadResponse = { success: false, images: result };
            callback(null, response);
        } catch (error: unknown) {
            callback(error as Partial<StatusObject> | ServerErrorResponse | null, null);
        }
    }
}

export default GrpcImageController;
