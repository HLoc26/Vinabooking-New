import { Job } from "bullmq";
import { IBaseWorker } from "./types";
import { PUBLISH_ACCOMMODATION_JOB, type PublishJobData } from "@/types/queue.types";
import { getEmbeddingModel } from "@/clients/gemini.client";
import { pineconeIndex } from "@/clients/pinecone.client";
import { aiLimiter } from "@/utils/ai-limiter";

export class PublishWorker implements IBaseWorker {
	public readonly queueName = "publish-task";
	public readonly concurrency = 2;

	public async process(job: Job<PublishJobData>): Promise<void> {
		if (job.name === PUBLISH_ACCOMMODATION_JOB) {
			await this.#handlePublishAccommodation(job.data);
		}
	}

	async #handlePublishAccommodation(data: PublishJobData) {
		const { accommodationId, name, type, lat, lon, description, facilities } = data;

		// 1. Construct text for embedding
		const textToEmbed = `Accommodation: ${name}
Type: ${type}
Description: ${description}
Facilities: ${facilities.join(", ")}`.trim();

		console.log(`[PublishWorker] Indexing accommodation ${accommodationId}: ${name}`);

		try {
			// 2. Vectorize using Gemini
			const result = await aiLimiter(() => getEmbeddingModel().embedContent(textToEmbed));
			const vector = result.embedding.values;

			// 3. Upsert into Pinecone
			await pineconeIndex.upsert({
				records: [
					{
						id: `acc_${accommodationId}`,
						values: vector,
						metadata: {
							type: "accommodation-profile",
							accommodationId,
							accommodationType: type,
							lat,
							lon,
							text: textToEmbed,
							createdAt: Date.now(),
						},
					},
				],
			});

			console.log(`[PublishWorker] Successfully indexed accommodation ${accommodationId}`);
		} catch (error: any) {
			console.error(`[PublishWorker] Failed to index accommodation ${accommodationId}:`, error.message);
			throw error;
		}
	}
}
