import { EEntityType, EVariantType } from "../../generated/prisma/index.js";
import PrismaSingleton from "../clients/PrismaSingleton.ts";
import type { FileType, UploadResult } from "../types/Image.ts";

class ImageRepostory {
    private prisma = PrismaSingleton.getInstance();

    public async uploadProfileImage(profileId: string, uploaded: UploadResult, original: FileType) {
        const s3Key = uploaded.get("ORIGINAL")?.get("s3Key");
        if (!s3Key) {
            throw new Error("");
        }
        const variants = [];
        const thumbnail = uploaded.get(EVariantType.THUMBNAIL);
        const webp = uploaded.get(EVariantType.WEBP);
        const optimized = uploaded.get(EVariantType.OPTIMIZED);

        if (thumbnail) {
            variants.push({ type: EVariantType.THUMBNAIL, s3Key: thumbnail.get("s3Key")!, id: thumbnail.get("id")! });
        }
        if (webp) {
            variants.push({ type: EVariantType.WEBP, s3Key: webp.get("s3Key")!, id: webp.get("id")! });
        }
        if (optimized) {
            variants.push({ type: EVariantType.OPTIMIZED, s3Key: optimized.get("s3Key")!, id: optimized.get("id")! });
        }
        return await this.prisma.image.create({
            data: {
                s3Key: s3Key,
                filename: s3Key,
                contentType: original.mimetype,
                size: BigInt(original.size),
                variants: { createMany: { data: variants } },
                references: { create: { entityType: EEntityType.USER_PROFILE, entityId: profileId } },
            },
        });
    }
}

export default ImageRepostory;
