/** Port for a key/value cache (Redis). The single place caching is abstracted. */
export interface ICacheService {
	get(key: string): Promise<string | null>;
	set(key: string, value: string, ttlSeconds?: number): Promise<void>;
	del(key: string): Promise<void>;
	incr(key: string): Promise<number>;
}
