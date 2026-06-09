import ImageRepository from "@/repositories/image.repository";
import S3Service from "./s3.service";
import { EntityType, Image } from "../models/image";
import { ImageDto } from "../dto/response/image.dto";

class ImageService {
	readonly #imageRepository: ImageRepository;
	readonly #s3Service: S3Service;

	constructor(imageRepository: ImageRepository, s3Service: S3Service) {
		this.#imageRepository = imageRepository;
		this.#s3Service = s3Service;
	}

	async getImage(type: EntityType, id: string): Promise<ImageDto[]> {
		const images = await this.#imageRepository.findByEntity(type, id);
		return this.mapToDto(images);
	}

	/**
	 *
	 * @param type entities' type
	 * @param ids list of ids
	 */
	async getImagesBatch(type: EntityType, ids: string[]): Promise<ImageDto[]> {
		const images = await this.#imageRepository.findByEntityBatch(type, ids);
		return this.mapToDto(images);
	}

	async deleteImage(id: string) {
		const image = await this.#imageRepository.findById(id);
		if (!image) return;

		await this.#imageRepository.deleteById(id);
		
		const keys = [image.getS3Key(), ...image.getVariants().map(v => v.getS3Key())];
		await this.#s3Service.deleteFiles(keys);
	}

	async deleteImagesByEntity(type: EntityType, id: string) {
		const images = await this.#imageRepository.findByEntity(type, id);
		if (images.length === 0) return;

		await this.#imageRepository.deleteByEntity(type, id);

		const keys: string[] = [];
		for (const img of images) {
			keys.push(img.getS3Key());
			for (const variant of img.getVariants()) {
				keys.push(variant.getS3Key());
			}
		}

		await this.#s3Service.deleteFiles(keys);
	}

	public mapToDto(images: Image[]): ImageDto[] {
		return images.map(img => ({
			id: img.getId(),
			s3Key: img.getS3Key(),
			filename: img.getFilename(),
			contentType: img.getContentType(),
			size: img.getSize().toString(),
			createdAt: img.getCreatedAt(),
			url: this.#s3Service.getS3Url(img.getS3Key()),
			variants: img.getVariants().map(v => ({
				id: v.getId(),
				imageId: v.getImageId(),
				s3Key: v.getS3Key(),
				variant: v.getVariant(),
				url: this.#s3Service.getS3Url(v.getS3Key()),
			})),
			references: img.getReferences().map(r => ({
				id: r.getId(),
				imageId: r.getImageId(),
				entityType: r.getEntityType(),
				entityId: r.getEntityId(),
				isPrimary: r.getIsPrimary(),
				createdAt: r.getCreatedAt(),
			}))
		}));
	}
}

export default ImageService;
