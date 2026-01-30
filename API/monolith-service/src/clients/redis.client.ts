import { createClient } from "redis";

const redisClient = createClient({
	url: process.env.REDIS_ENDPOINT,
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

// Kết nối ngay hoặc để lazy tùy ý, nhưng node-redis khuyên nên connect sớm
const connectRedis = async () => {
	if (!redisClient.isOpen) {
		await redisClient.connect();
	}
	return redisClient;
};

export { connectRedis };
export default redisClient;
