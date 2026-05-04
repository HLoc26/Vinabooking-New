import "dotenv/config";
import prismaClient from "../clients/prisma.client";
import { reviewQueue } from "../clients/queue.client";
import { EReviewJobName, type ReviewJobData } from "../types/queue.types";

async function syncExistingReviews() {
	console.log("Starting sync of existing reviews to Pinecone...");

	try {
		// 1. Fetch all reviews from the database with accommodation coordinates
		const reviews = await prismaClient.review.findMany({
			include: {
				accommodation: {
					include: {
						address: true,
					},
				},
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

			const address = review.accommodation?.address;

			if (!address || address.latitude === null || address.longitude === null) {
				console.warn(`Skipping review ${review.id}: Accommodation ${review.accommodationId} has no coordinates.`);
				skippedCount++;
				continue;
			}

			const jobData: ReviewJobData = {
				reviewId: review.id,
				accommodationId: review.accommodationId,
				text: review.comment,
				rating: review.star,
				lat: Number(address.latitude),
				lon: Number(address.longitude),
				createdAt: review.createdAt.getTime(),
			};

			await reviewQueue.add(EReviewJobName.PROCESS_TO_VECTORS, jobData, {
				jobId: `sync-review-${review.id}`, // Prevent duplicate jobs if script is re-run
				removeOnComplete: true,
			});
			addedCount++;

			if (addedCount % 100 === 0) {
				console.log(`Progress: ${addedCount} jobs added...`);
			}
		}

		console.log("Sync script finished!");
		console.log(`Added: ${addedCount} jobs to queue.`);
		console.log(`Skipped: ${skippedCount} reviews.`);
		console.log("The Worker will now process these jobs using Gemini embeddings.");
	} catch (error) {
		console.error("Error during sync:", error);
	} finally {
		await prismaClient.$disconnect();
		process.exit(0);
	}
}

// Run the script
syncExistingReviews();
