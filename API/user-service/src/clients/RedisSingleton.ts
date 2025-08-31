import { createClient, type RedisClientType } from "redis";

class RedisClient {
    private static instance: RedisClientType;

    constructor() {}

    public static getInstance() {
        if (!this.instance) {
            this.instance = createClient();
        }
        return this.instance;
    }
}

export default RedisClient;
