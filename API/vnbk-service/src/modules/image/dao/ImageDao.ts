import { injectable } from "tsyringe";
import { EVariantType as PrismaVariantType } from "@/generated/client";
import { PrismaProvider } from "@/infrastructure/persistence/PrismaProvider";
import { BaseDao } from "@/infrastructure/persistence/BaseDao";
import type { IImageRepository } from "@/modules/image/repository/IImageRepository";
import type { SaveImageCommand } from "@/modules/image/repository/SaveImageCommand";
import type { UploadedVariantRecord } from "@/modules/image/repository/UploadedVariantRecord";
import type { Image } from "@/modules/image/domain/Image";
import { EEntityType } from "@/modules/image/enums/EEntityType";
import { EVariantType } from "@/modules/image/enums/EVariantType";
import { ImageEntityMapper } from "@/modules/image/dao/mapper/ImageEntityMapper";
import { BadRequestError } from "@/shared/error/BadRequestError";

/** Prisma-backed implementation of IImageRepository. The only place Image touches Prisma. */
@injectable()
export class ImageDao extends BaseDao implements IImageRepository {
	constructor(
		private readonly prisma: PrismaProvider,
		private readonly mapper: ImageEntityMapper
	) {
		super();
	}

	public async saveEntityImage(command: SaveImageCommand): Promise<UploadedVariantRecord[]> {
		return this.run(async () => {
			const { entityType, entityId, uploaded, filename, contentType, size } = command;

			const originalKey = uploaded.get(EVariantType.ORIGINAL)?.s3Key;
			if (!originalKey) throw new BadRequestError("Missing original image s3Key");

			// Every non-original variant that was uploaded becomes an ImageVariant row.
			const variants: UploadedVariantRecord[] = [];
			for (const variant of Object.values(EVariantType)) {
				if (variant === EVariantType.ORIGINAL) continue;
				const data = uploaded.get(variant);
				if (data) variants.push({ variant, s3Key: data.s3Key, id: data.id });
			}

			// A profile image is the single primary image: demote any previous primary first.
			if (entityType === EEntityType.USER_PROFILE) {
				await this.removePrimary(entityId);
			}

			const image = await this.prisma.client.image.create({
				data: {
					s3Key: originalKey,
					filename,
					contentType,
					size: BigInt(size),
					variants: { createMany: { data: variants.map((v) => ({ s3Key: v.s3Key, variant: v.variant as PrismaVariantType })) } },
					references: { create: { entityType, entityId, isPrimary: entityType === EEntityType.USER_PROFILE } },
				},
			});

			// Mirror the monolith: return variants plus the original (keyed by the image row id).
			variants.push({
				id: image.id,
				s3Key: originalKey,
				variant: EVariantType.ORIGINAL,
			});

			return variants;
		});
	}

	public async getEntityImageBatch(entityType: EEntityType, entityIds: string[]): Promise<Image[]> {
		return this.run(async () => {
			const entities = await this.prisma.client.image.findMany({
				where: {
					references: {
						some: {
							entityId: { in: entityIds },
							entityType,
						},
					},
				},
				include: {
					variants: true,
					references: true,
				},
			});
			return entities.map((entity) => this.mapper.toDomain(entity));
		});
	}

	public async countByEntity(entityType: EEntityType, entityId: string): Promise<number> {
		return this.run(async () => {
			return this.prisma.client.imageReference.count({
				where: { entityId, entityType },
			});
		});
	}

	public async deleteImage(imageId: string): Promise<string[]> {
		return this.run(async () => {
			const image = await this.prisma.client.image.findUnique({
				where: { id: imageId },
				include: { variants: true },
			});
			if (!image) return [];

			const s3Keys: string[] = [image.s3Key, ...image.variants.map((v) => v.s3Key)];

			await this.prisma.client.$transaction([
				this.prisma.client.imageVariant.deleteMany({ where: { imageId } }),
				this.prisma.client.imageReference.deleteMany({ where: { imageId } }),
				this.prisma.client.image.delete({ where: { id: imageId } }),
			]);

			return s3Keys;
		});
	}

	public async deleteEntityImages(entityType: EEntityType, entityId: string): Promise<string[]> {
		return this.run(async () => {
			const images = await this.prisma.client.image.findMany({
				where: {
					references: {
						some: { entityId, entityType },
					},
				},
				include: { variants: true },
			});
			if (images.length === 0) return [];

			const s3Keys: string[] = [];
			const imageIds: string[] = [];
			for (const img of images) {
				s3Keys.push(img.s3Key);
				imageIds.push(img.id);
				for (const variant of img.variants) {
					s3Keys.push(variant.s3Key);
				}
			}

			await this.prisma.client.$transaction([
				this.prisma.client.imageVariant.deleteMany({ where: { imageId: { in: imageIds } } }),
				this.prisma.client.imageReference.deleteMany({ where: { imageId: { in: imageIds } } }),
				this.prisma.client.image.deleteMany({ where: { id: { in: imageIds } } }),
			]);

			return s3Keys;
		});
	}

	/** Demote any currently-primary reference for the entity (used for single-primary profile images). */
	private async removePrimary(entityId: string): Promise<void> {
		await this.prisma.client.imageReference.updateMany({
			where: { entityId, isPrimary: true },
			data: { isPrimary: false },
		});
	}
}
