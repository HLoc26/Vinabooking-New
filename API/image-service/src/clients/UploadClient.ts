import multer from "multer";

class UploadClient {
    private static instance: multer.Multer;
    constructor() {}
    public static getInstance() {
        if (!UploadClient.instance) {
            UploadClient.instance = multer({ storage: multer.memoryStorage() });
        }
        return UploadClient.instance;
    }
}
export default UploadClient;
