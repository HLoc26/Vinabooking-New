/** Low-level object storage port (S3). Higher-level image logic lives in the image module. */
export interface IObjectStorage {
	putObject(key: string, body: Buffer, contentType: string): Promise<void>;
	deleteObjects(keys: string[]): Promise<void>;
	getPublicUrl(key: string): string;
}
