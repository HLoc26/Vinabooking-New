import { EEntityType } from "@/generated/enums";
import ImageRepository from "@/repositories/image.repository";
import { ImageFullInfo } from "@/types/image.types";
import S3Service from "./s3.service";

class ImageService {
	readonly #imageRepository: ImageRepository;
	readonly #s3Service: S3Service;
	constructor(imageRepository: ImageRepository, s3Service: S3Service) {
		this.#imageRepository = imageRepository;
		this.#s3Service = s3Service;
	}

	async getImage(type: EEntityType, id: string): Promise<ImageFullInfo[]> {
		const images = await this.#imageRepository.getEntityImage(type, id);
		const sanitizedImages = images.map((img) => ({
			...img,
			// 1. Convert BigInt to string for JSON safety
			size: img.size.toString(),

			// 2. Add the full URL to the main image object
			url: this.#s3Service.getS3Url(img.s3Key),

			// 3. Map over variants to add the full URL to them as well
			variants: img.variants.map((v) => ({
				...v,
				url: this.#s3Service.getS3Url(v.s3Key),
			})),
		}));
		return sanitizedImages;
	}
}

export default ImageService;
