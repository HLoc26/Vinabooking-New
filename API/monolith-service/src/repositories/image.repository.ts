import { PrismaClient } from "@/generated/client";
import { Image, EntityType } from "../models/image";
import { ImageMapper } from "../mappers/image.mapper";

export default class ImageRepository {
	readonly #prisma: PrismaClient;

	constructor(prisma: PrismaClient) {
		this.#prisma = prisma;
	}

	public async save(image: Image): Promise<void> {
		const persistenceImage = ImageMapper.toPersistence(image);

		// We will do an upsert or create. Since IDs are pre-generated, we can do a create or update.
		// For simplicity in this legacy refactor, if we assume images are always created fresh:
		const imageExists = await this.#prisma.image.findUnique({ where: { id: persistenceImage.id } });

		if (imageExists) {
            // Wait, we need to handle updates if necessary, but images are typically immutable and just deleted/created.
			// Let's implement full update if needed.
			await this.#prisma.$transaction([
				this.#prisma.imageVariant.deleteMany({ where: { imageId: persistenceImage.id } }),
				this.#prisma.imageReference.deleteMany({ where: { imageId: persistenceImage.id } }),
				this.#prisma.image.update({
					where: { id: persistenceImage.id },
					data: {
						s3Key: persistenceImage.s3Key,
						filename: persistenceImage.filename,
						contentType: persistenceImage.contentType,
						size: persistenceImage.size,
						createdAt: persistenceImage.createdAt,
						variants: {
							createMany: {
								data: persistenceImage.variants?.map(v => ({
									id: v.id,
									s3Key: v.s3Key,
									variant: v.variant
								})) || []
							}
						},
						references: {
							createMany: {
								data: persistenceImage.references?.map(r => ({
									id: r.id,
									entityType: r.entityType,
									entityId: r.entityId,
									isPrimary: r.isPrimary,
									createdAt: r.createdAt
								})) || []
							}
						}
					}
				})
			]);
		} else {
			await this.#prisma.image.create({
				data: {
					id: persistenceImage.id,
					s3Key: persistenceImage.s3Key,
					filename: persistenceImage.filename,
					contentType: persistenceImage.contentType,
					size: persistenceImage.size,
					createdAt: persistenceImage.createdAt,
					variants: {
						createMany: {
							data: persistenceImage.variants?.map(v => ({
								id: v.id,
								s3Key: v.s3Key,
								variant: v.variant
							})) || []
						}
					},
					references: {
						createMany: {
							data: persistenceImage.references?.map(r => ({
								id: r.id,
								entityType: r.entityType,
								entityId: r.entityId,
								isPrimary: r.isPrimary,
								createdAt: r.createdAt
							})) || []
						}
					}
				}
			});
		}
	}

	public async findById(id: string): Promise<Image | null> {
		const result = await this.#prisma.image.findUnique({
			where: { id },
			include: { variants: true, references: true }
		});

		if (!result) return null;
		return ImageMapper.toDomain(result);
	}

	public async findByEntity(entityType: EntityType, entityId: string): Promise<Image[]> {
		return await this.findByEntityBatch(entityType, [entityId]);
	}

	public async findByEntityBatch(entityType: EntityType, entityIds: string[]): Promise<Image[]> {
		const results = await this.#prisma.image.findMany({
			where: {
				references: {
					some: {
						entityId: { in: entityIds },
						entityType: entityType as any,
					},
				},
			},
			include: { variants: true, references: true }
		});

		return results.map(r => ImageMapper.toDomain(r));
	}

	public async deleteById(id: string): Promise<void> {
		await this.#prisma.$transaction([
			this.#prisma.imageVariant.deleteMany({ where: { imageId: id } }),
			this.#prisma.imageReference.deleteMany({ where: { imageId: id } }),
			this.#prisma.image.delete({ where: { id } }),
		]);
	}

	public async deleteByEntity(entityType: EntityType, entityId: string): Promise<void> {
		const images = await this.#prisma.image.findMany({
			where: {
				references: {
					some: { entityId, entityType: entityType as any }
				}
			},
			select: { id: true }
		});

		const imageIds = images.map(img => img.id);
		if (imageIds.length === 0) return;

		await this.#prisma.$transaction([
			this.#prisma.imageVariant.deleteMany({ where: { imageId: { in: imageIds } } }),
			this.#prisma.imageReference.deleteMany({ where: { imageId: { in: imageIds } } }),
			this.#prisma.image.deleteMany({ where: { id: { in: imageIds } } }),
		]);
	}

	public async countByEntity(entityType: EntityType, entityId: string): Promise<number> {
		return await this.#prisma.imageReference.count({
			where: {
				entityId: entityId,
				entityType: entityType as any,
			},
		});
	}

	public async clearPrimaryReference(entityType: EntityType, entityId: string): Promise<void> {
		await this.#prisma.imageReference.updateMany({
			where: {
				entityId: entityId,
				entityType: entityType as any,
				isPrimary: true,
			},
			data: {
				isPrimary: false,
			},
		});
	}
}
