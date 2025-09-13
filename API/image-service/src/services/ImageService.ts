import ImageRepostory from "../repositories/ImageRepository.ts";
import type { FileType, UploadResult } from "../types/Image.ts";

class ImageService {
    private imageRepository = new ImageRepostory();
    public async uploadProfileImage(profileId: string, uploaded: UploadResult, original: FileType) {
        const response = await this.imageRepository.uploadProfileImage(profileId, uploaded, original);
        if (response.id && response.s3Key) {
            return true;
        }
        return false;
    }
    public async uploadAccommodationImage() {}
    public async uploadRoomImage() {}
    public async uploadReviewImage() {}
}

export default ImageService;
