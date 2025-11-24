import { EEntityType, EVariantType } from "../../generated/prisma/index.js";
import PrismaSingleton from "../clients/PrismaSingleton";
import type { FileType, UploadedImage, UploadResult } from "../types/Image";

export default class ImageRepository {
	private prisma = PrismaSingleton.getInstance();

	public async saveEntityImage(entityType: EEntityType, entityId: string, uploaded: UploadResult, original: FileType) {
		const s3Key = uploaded.get(EVariantType.ORIGINAL)?.get("s3Key");
		if (!s3Key) throw new Error("Missing original image s3Key");

		const variants = Object.values(EVariantType)
			.filter((variant) => variant !== EVariantType.ORIGINAL)
			.map((variant) => {
				const data = uploaded.get(variant);
				return data ? { variant: variant, s3Key: data.get("s3Key")!, id: data.get("id")! } : null;
			})
			.filter(Boolean) as UploadedImage[];

		if (entityType === EEntityType.USER_PROFILE) await this.removePrimary(entityId);

		const image = await this.prisma.image.create({
			data: {
				s3Key,
				filename: s3Key,
				contentType: original.mimetype,
				size: BigInt(original.size),
				variants: { createMany: { data: variants } },
				references: { create: { entityType, entityId, isPrimary: entityType === "USER_PROFILE" } },
			},
		});

		variants.push({
			id: image.id,
			s3Key,
			variant: EVariantType.ORIGINAL,
		});

		return variants;
	}

	private async removePrimary(userId: string) {
		// Make other images not primary
		await this.prisma.imageReference.updateMany({
			where: {
				entityId: userId,
				isPrimary: true,
			},
			data: {
				isPrimary: false,
			},
		});
	}

	public async getEntityImage(entityType: EEntityType, entityId: string) {
		const images = await this.prisma.image.findMany({
			where: {
				references: {
					some: {
						entityId: entityId,
						entityType: entityType,
					},
				},
			},
			include: {
				variants: true,
				references: {
					select: {
						isPrimary: true,
					},
				},
			},
		});
		return images;
	}
}
