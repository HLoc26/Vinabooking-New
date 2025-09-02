import { createClient, type RedisClientType } from "redis";

class RedisClient {
    private static instance: RedisClientType;

    constructor() {}

    public static getInstance() {
        if (!this.instance) {
            this.instance = createClient({
                url: process.env["REDIS_ENDPOINT"]!,
            });
        }
        return this.instance;
    }
}

export default RedisClient;
