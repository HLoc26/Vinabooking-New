import "dotenv/config";
import prismaClient from "../clients/prisma.client";
import { publishQueue } from "../clients/queue.client";
import { PUBLISH_ACCOMMODATION_JOB, type PublishJobData } from "../types/queue.types";

async function syncExistingAccommodations() {
	console.log("Starting sync of existing accommodations to Pinecone...");

	try {
		// 1. Fetch all PUBLISHED accommodations from the database
		const accommodations = await prismaClient.accommodation.findMany({
			where: {
				status: "PUBLISHED",
			},
			include: {
				address: true,
				facilities: {
					include: {
						facility: true,
					},
				},
			},
		});

		console.log(`Found ${accommodations.length} published accommodations in database.`);

		let addedCount = 0;
		let skippedCount = 0;

		// 2. Push each accommodation into the Publish Queue
		for (const acc of accommodations) {
			if (!acc.address || acc.address.latitude === null || acc.address.longitude === null) {
				console.warn(`Skipping accommodation ${acc.id}: Missing address or coordinates.`);
				skippedCount++;
				continue;
			}

			const jobData: PublishJobData = {
				accommodationId: acc.id,
				name: acc.name,
				type: acc.type,
				lat: Number(acc.address.latitude),
				lon: Number(acc.address.longitude),
				description: acc.description || "",
				facilities: acc.facilities.map((f) => f.facility.name),
			};

			await publishQueue.add(PUBLISH_ACCOMMODATION_JOB, jobData, {
				jobId: `sync-acc-${acc.id}`, // Prevent duplicate jobs if script is re-run
				removeOnComplete: true,
			});

			addedCount++;

			if (addedCount % 50 === 0) {
				console.log(`Progress: ${addedCount} jobs added...`);
			}
		}

		console.log("Sync script finished!");
		console.log(`Added: ${addedCount} jobs to queue.`);
		console.log(`Skipped: ${skippedCount} accommodations.`);
		console.log("The PublishWorker will now process these jobs to update Pinecone embeddings.");
	} catch (error) {
		console.error("Error during sync:", error);
	} finally {
		await prismaClient.$disconnect();
		process.exit(0);
	}
}

// Run the script
syncExistingAccommodations();
