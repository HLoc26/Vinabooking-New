// Public surface of the image module. Other modules import ONLY from here.
export type { IImageService, EntityImagesMap } from "@/modules/image/service/IImageService";
export { IMAGE_SERVICE } from "@/modules/image/image.tokens";
export { EEntityType } from "@/modules/image/enums/EEntityType";
export { EVariantType } from "@/modules/image/enums/EVariantType";
export { ImageResponse, ImageReferenceResponse } from "@/modules/image/dto/response/ImageResponse";
export { ImageVariantResponse } from "@/modules/image/dto/response/ImageVariantResponse";
export { UploadedImageResponse } from "@/modules/image/dto/response/UploadedImageResponse";
export { ImageModule } from "@/modules/image/ImageModule";
