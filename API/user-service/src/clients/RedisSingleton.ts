import { createClient, type RedisClientType } from "redis";

class RedisClient {
    private static instance: RedisClientType | null = null;
    private static connected: boolean = false;

    private constructor() {}

    public static async getInstance(): Promise<RedisClientType> {
        if (!this.instance) {
            this.instance = createClient({
                url: process.env["REDIS_ENDPOINT"]!,
            });

            this.instance.on("error", (err) => console.error("Redis Client Error", err));

            await this.instance.connect();
            this.connected = true;
        } else if (!this.connected) {
            await this.instance.connect();
            this.connected = true;
        }

        return this.instance;
    }
}

let redisClient: RedisClientType;
export async function getRedisClient() {
    if (!redisClient) {
        redisClient = await RedisClient.getInstance();
    }
    return redisClient;
}
