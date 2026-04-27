import { Queue } from "bullmq";
import Redis from "ioredis";

const redisConnection = new Redis(process.env["REDIS_ENDPOINT"]!, {
	maxRetriesPerRequest: null,
});

export const aiQueue = new Queue("ai-task", {
	connection: redisConnection,
	defaultJobOptions: {
		attempts: 3,
		backoff: { type: "exponential", delay: 5000 },
		removeOnComplete: 100,
		removeOnFail: 1000,
	},
});

export const getRedisConnection = () => {
	return redisConnection.duplicate();
};
