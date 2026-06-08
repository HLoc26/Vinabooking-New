import { Worker } from "bullmq";
import { IBaseWorker } from "./types";
import { getRedisConnection } from "@/clients/queue.client";

export class WorkerManager {
	private workers: Worker[] = [];

	constructor(private registeredWorkers: IBaseWorker[]) {}

	public start() {
		for (const workerDef of this.registeredWorkers) {
			const worker = new Worker(
				workerDef.queueName,
				async (job) => {
					console.log(`[WorkerManager] Processing job ${job.id} (${job.name}) on queue ${workerDef.queueName}`);
					await workerDef.process(job);
				},
				{
					connection: getRedisConnection() as any,
					concurrency: workerDef.concurrency || 1,
					lockDuration: 60000, // 60 secs
				}
			);

			worker.on("failed", (job, err) => {
				console.error(`[WorkerManager] Queue ${workerDef.queueName} job ${job?.id} failed: ${err.message}`);
			});

			worker.on("completed", (job) => {
				console.log(`[WorkerManager] Queue ${workerDef.queueName} job ${job.id} completed`);
			});

			this.workers.push(worker);
		}

		console.log(`[WorkerManager] Started ${this.workers.length} workers`);
	}

	public async stop() {
		await Promise.all(this.workers.map((worker) => worker.close()));
		console.log("[WorkerManager] All workers stopped");
	}
}
