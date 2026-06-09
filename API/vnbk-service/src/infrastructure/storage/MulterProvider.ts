import { singleton } from "tsyringe";
import multer from "multer";

/** Provides a shared in-memory Multer instance for multipart upload routes. */
@singleton()
export class MulterProvider {
	public readonly upload = multer({ storage: multer.memoryStorage() });
}
