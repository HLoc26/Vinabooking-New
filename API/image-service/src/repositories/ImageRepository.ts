import { EEntityType, EVariantType } from "../../generated/prisma/index.js";
import PrismaSingleton from "../clients/PrismaSingleton";
import type { FileType, UploadResult } from "../types/Image";

export default class ImageRepository {
    private prisma = PrismaSingleton.getInstance();

    public async saveProfileImage(userId: string, uploaded: UploadResult, original: FileType) {
        const originalVariant = uploaded.get(EVariantType.ORIGINAL);
        const s3Key = originalVariant?.get("s3Key");
        if (!s3Key) {
            throw new Error("Missing original image s3Key");
        }

        const variants = Object.values(EVariantType)
            .filter((v) => v !== EVariantType.ORIGINAL)
            .map((type) => {
                const data = uploaded.get(type);
                return data ? { type, s3Key: data.get("s3Key")!, id: data.get("id")! } : null;
            })
            .filter(Boolean) as { type: EVariantType; s3Key: string; id: string }[];

        return this.prisma.image.create({
            data: {
                s3Key,
                filename: s3Key,
                contentType: original.mimetype,
                size: BigInt(original.size),
                variants: { createMany: { data: variants } },
                references: {
                    create: { entityType: EEntityType.USER_PROFILE, entityId: userId },
                },
            },
        });
    }

    public async saveEntityImage(entityType: EEntityType, entityId: string, uploaded: UploadResult, original: FileType) {
        const s3Key = uploaded.get(EVariantType.ORIGINAL)?.get("s3Key");
        if (!s3Key) throw new Error("Missing original image s3Key");

        const variants = Object.values(EVariantType)
            .filter((v) => v !== EVariantType.ORIGINAL)
            .map((v) => {
                const data = uploaded.get(v);
                return data ? { type: v, s3Key: data.get("s3Key")!, id: data.get("id")! } : null;
            })
            .filter(Boolean) as { type: EVariantType; s3Key: string; id: string }[];

        return this.prisma.image.create({
            data: {
                s3Key,
                filename: s3Key,
                contentType: original.mimetype,
                size: BigInt(original.size),
                variants: { createMany: { data: variants } },
                references: { create: { entityType, entityId } },
            },
        });
    }

    public async saveAccommodationImage(accommodationId: string, uploaded: UploadResult, original: FileType) {
        return this.saveGenericImage(accommodationId, uploaded, original, EEntityType.ACCOMMODATION);
    }

    public async saveRoomImage(roomId: string, uploaded: UploadResult, original: FileType) {
        return this.saveGenericImage(roomId, uploaded, original, EEntityType.ROOM);
    }

    public async saveReviewImage(reviewId: string, uploaded: UploadResult, original: FileType) {
        return this.saveGenericImage(reviewId, uploaded, original, EEntityType.REVIEW);
    }

    private async saveGenericImage(entityId: string, uploaded: UploadResult, original: FileType, entityType: EEntityType) {
        const s3Key = uploaded.get("ORIGINAL")?.get("s3Key");
        if (!s3Key) throw new Error("Missing original image");

        const variants = Array.from(uploaded.entries())
            .filter(([key]) => key !== "ORIGINAL")
            .map(([variant, props]) => ({
                type: variant,
                s3Key: props.get("s3Key")!,
                id: props.get("id")!,
            }));

        return this.prisma.image.create({
            data: {
                s3Key,
                filename: s3Key,
                contentType: original.mimetype,
                size: BigInt(original.size),
                variants: { createMany: { data: variants } },
                references: { create: { entityType, entityId } },
            },
        });
    }
}
