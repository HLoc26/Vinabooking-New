import { createClient } from "redis";

const redisClient = createClient({
	url: process.env.REDIS_ENDPOINT,
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

const connectRedis = async () => {
	if (!redisClient.isOpen) {
		await redisClient.connect();
	}
	return redisClient;
};

export { connectRedis };
export default redisClient;
