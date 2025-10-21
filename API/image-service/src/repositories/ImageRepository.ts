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

        const image = await this.prisma.image.create({
            data: {
                s3Key,
                filename: s3Key,
                contentType: original.mimetype,
                size: BigInt(original.size),
                variants: { createMany: { data: variants } },
                references: { create: { entityType, entityId } },
            },
        });

        variants.push({
            id: image.id,
            s3Key,
            variant: EVariantType.ORIGINAL,
        });

        return variants;
    }
}
