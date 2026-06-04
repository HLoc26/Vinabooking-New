import "dotenv/config";
import prismaClient from "../clients/prisma.client";
import { reviewQueue } from "../clients/queue.client";
import { EReviewJobName } from "../types/queue.types";

async function triggerSummariesForEligibleAccommodations() {
	console.log("Starting manual trigger for review summaries...");
	console.log("Criteria: No existing summary AND more than 20 reviews.");

	try {
		// 1. Fetch accommodations that don't have a summary and have more than 20 reviews
		const accommodations = await prismaClient.accommodation.findMany({
			where: {
				accommodationReviewSummaries: {
					is: null,
				},
				reviews: {
					some: {}, // Optimization: ensure there's at least one review before counting
				},
			},
			include: {
				_count: {
					select: { reviews: true },
				},
			},
		});

		const eligible = accommodations.filter((acc) => acc._count.reviews > 10);

		console.log(`Found ${eligible.length} eligible accommodations.`);

		let addedCount = 0;

		// 2. Push each accommodation into the Queue
		for (const acc of eligible) {
			await reviewQueue.add(
				EReviewJobName.SUMMARIZE_REVIEWS,
				{
					accommodationId: acc.id,
				},
				{
					jobId: `manual-trigger-${acc.id}-${Date.now()}`,
					removeOnComplete: true,
				}
			);
			addedCount++;

			console.log(`[${addedCount}/${eligible.length}] Triggered summary for: ${acc.name} (${acc.id}) - ${acc._count.reviews} reviews`);
		}

		console.log("\nSummary trigger script finished!");
		console.log(`Successfully added ${addedCount} jobs to the review queue.`);
	} catch (error) {
		console.error("Error during trigger process:", error);
	} finally {
		await prismaClient.$disconnect();
		process.exit(0);
	}
}

// Run the script
triggerSummariesForEligibleAccommodations();
