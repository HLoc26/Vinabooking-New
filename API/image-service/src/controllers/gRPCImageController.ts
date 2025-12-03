import { sendUnaryData, ServerErrorResponse, ServerUnaryCall, StatusObject } from "@grpc/grpc-js";
import { Empty } from "../../generated/grpc/image-service/google/protobuf/empty";
import {
	EVariantType,
	eVariantTypeFromJSON,
	GetImageRequest,
	GetImageResponse,
	HealthResponse,
	ResponseImage,
	UploadedImage,
	UploadRequest,
	UploadResponse,
} from "../../generated/grpc/image-service/image-service";
import { UploadService } from "../services/UploadService";
import { FileType } from "../types/Image";
import { Readable } from "stream";
import ImageRepository from "../repositories/ImageRepository";
import MappingUtil from "../utils/MappingUtil";
import S3Service from "../services/S3Service";

export class GrpcImageControllerFactory {
	static createGrpcController() {
		const s3Service = new S3Service();
		const imageRepository = new ImageRepository();
		const uploadService = new UploadService(s3Service, imageRepository);
		const grpcImageController = new GrpcImageController(uploadService, imageRepository, s3Service);
		return grpcImageController;
	}
}

class GrpcImageController {
	constructor(
		private readonly uploadService: UploadService,
		private readonly imageRepository: ImageRepository,
		private readonly s3Service: S3Service
	) {}

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

	async getImages(call: ServerUnaryCall<GetImageRequest, GetImageResponse>, callback: sendUnaryData<GetImageResponse>) {
		try {
			const { entityType, id } = call.request;
			const type = MappingUtil.entityTypeMapping(entityType);
			const result = await this.imageRepository.getEntityImage(type, id);

			const images = result.flatMap((img) => {
				const baseVariant: ResponseImage = {
					id: img.id,
					url: this.s3Service.getS3Url(img.s3Key),
					variant: EVariantType.ORIGINAL,
					imageId: img.id,
				};
				const variants: ResponseImage[] = img.variants.map((img) => {
					const variantImg: ResponseImage = {
						id: img.id,
						url: this.s3Service.getS3Url(img.s3Key),
						variant: eVariantTypeFromJSON(img.variant),
						imageId: img.id,
					};
					return variantImg;
				});
				return [baseVariant, ...variants];
			});
			callback(null, { images });
		} catch (error) {
			callback(error as Partial<StatusObject> | ServerErrorResponse | null, null);
		}
	}
}

export default GrpcImageController;
