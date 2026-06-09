import { singleton } from "tsyringe";
import { S3Client, PutObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { AppConfig } from "@/config/AppConfig";
import type { IObjectStorage } from "@/infrastructure/storage/IObjectStorage";

const DELETE_CHUNK_SIZE = 1000;

/** AWS S3-backed IObjectStorage. Client + config are resolved lazily on first use. */
@singleton()
export class S3Storage implements IObjectStorage {
	private client?: S3Client;
	private bucket?: string;
	private region?: string;

	constructor(private readonly config: AppConfig) {}

	private getClient(): S3Client {
		if (!this.client) {
			this.region = this.config.getRequired("S3_REGION");
			this.bucket = this.config.getRequired("S3_BUCKET_NAME");
			this.client = new S3Client({
				region: this.region,
				credentials: {
					accessKeyId: this.config.getRequired("AWS_ACCESS_KEY_ID"),
					secretAccessKey: this.config.getRequired("AWS_SECRET_ACCESS_KEY"),
				},
			});
		}
		return this.client;
	}

	public async putObject(key: string, body: Buffer, contentType: string): Promise<void> {
		await this.getClient().send(
			new PutObjectCommand({
				Bucket: this.bucket,
				Key: key,
				Body: body,
				ContentType: contentType,
				ACL: "public-read",
			})
		);
	}

	public async deleteObjects(keys: string[]): Promise<void> {
		if (keys.length === 0) return;
		const client = this.getClient();
		const tasks: Promise<unknown>[] = [];
		for (let i = 0; i < keys.length; i += DELETE_CHUNK_SIZE) {
			const chunk = keys.slice(i, i + DELETE_CHUNK_SIZE);
			tasks.push(
				client.send(
					new DeleteObjectsCommand({
						Bucket: this.bucket,
						Delete: { Objects: chunk.map((key) => ({ Key: key })), Quiet: true },
					})
				)
			);
		}
		await Promise.all(tasks);
	}

	public getPublicUrl(key: string): string {
		// Force lazy init so bucket/region are populated.
		this.getClient();
		return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
	}
}
