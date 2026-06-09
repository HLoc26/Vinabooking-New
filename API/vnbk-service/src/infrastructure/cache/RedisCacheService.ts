import { singleton } from "tsyringe";
import { createClient, type RedisClientType } from "redis";
import { AppConfig } from "@/config/AppConfig";
import type { ICacheService } from "@/infrastructure/cache/ICacheService";

/** Redis-backed ICacheService. Connects lazily on first use. */
@singleton()
export class RedisCacheService implements ICacheService {
	private readonly client: RedisClientType;

	constructor(config: AppConfig) {
		this.client = createClient({ url: config.get("REDIS_ENDPOINT") });
		this.client.on("error", (err) => console.error("Redis Client Error", err));
	}

	private async ensureConnected(): Promise<void> {
		if (!this.client.isOpen) {
			await this.client.connect();
		}
	}

	public async get(key: string): Promise<string | null> {
		await this.ensureConnected();
		return this.client.get(key);
	}

	public async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
		await this.ensureConnected();
		if (ttlSeconds !== undefined) {
			await this.client.set(key, value, { EX: ttlSeconds });
		} else {
			await this.client.set(key, value);
		}
	}

	public async del(key: string): Promise<void> {
		await this.ensureConnected();
		await this.client.del(key);
	}

	public async incr(key: string): Promise<number> {
		await this.ensureConnected();
		return this.client.incr(key);
	}
}
