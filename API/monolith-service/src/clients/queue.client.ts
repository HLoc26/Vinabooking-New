import { Queue } from "bullmq";
import Redis from "ioredis";

export const redisConnection = new Redis(process.env.REDIS_ENDPOINT!);

export const aiQueue = new Queue("ai-task", {
	connection: redisConnection,
	defaultJobOptions: {
		attempts: 3,
		backoff: { type: "exponential", delay: 5000 },
		removeOnComplete: 100, // only keep 100 jobs
		removeOnFail: 10000,
	},
});
