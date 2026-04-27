import "dotenv/config";
import prismaClient from "../clients/prisma.client";
import { aiQueue } from "../clients/queue.client";
import { EReviewJobName } from "../types/review.types";

async function syncExistingReviews() {
	console.log("Starting sync of existing reviews to Pinecone...");

	try {
		// 1. Fetch all reviews from the database
		const reviews = await prismaClient.review.findMany({
			select: {
				id: true,
				accommodationId: true,
				comment: true,
				star: true,
			},
		});

		console.log(`Found ${reviews.length} reviews in database.`);

		let addedCount = 0;
		let skippedCount = 0;

		// 2. Push each review into the Queue
		for (const review of reviews) {
			// Basic validation matching the worker's logic
			if (!review.star || !review.comment || review.comment.length < 10) {
				skippedCount++;
				continue;
			}

			await aiQueue.add(
				EReviewJobName.PROCESS_TO_VECTORS,
				{
					reviewId: review.id,
					accommodationId: review.accommodationId,
					text: review.comment,
					rating: review.star,
				},
				{
					jobId: `sync-review-${review.id}`, // Prevent duplicate jobs if script is re-run
					removeOnComplete: true,
				}
			);
			addedCount++;

			if (addedCount % 100 === 0) {
				console.log(`Progress: ${addedCount} jobs added...`);
			}
		}

		console.log("Sync script finished!");
		console.log(`Added: ${addedCount} jobs to queue.`);
		console.log(`Skipped: ${skippedCount} short or invalid reviews.`);
		console.log("The Worker will now process these jobs using Gemini embeddings.");
	} catch (error) {
		console.error("Error during sync:", error);
	} finally {
		await prismaClient.$disconnect();
		// We don't necessarily need to disconnect redis if the process is going to exit
		process.exit(0);
	}
}

// Run the script
syncExistingReviews();
