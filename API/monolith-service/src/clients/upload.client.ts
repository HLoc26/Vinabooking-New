import multer from "multer";

/**
 * Helper to upload from UI to backend
 */
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
