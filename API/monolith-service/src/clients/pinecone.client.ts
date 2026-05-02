import { Pinecone, RecordMetadata } from "@pinecone-database/pinecone";

const pc = new Pinecone({
	apiKey: process.env["PINECONE_API_KEY"]!,
});

export interface ReviewRecordMetadata extends RecordMetadata {
	reviewId: string;
	text: string;
	accommodationId: string;
	type: "accommodation-profile" | "review";
	city: string;
	rating: number;
	sentiment: string;
	createdAt: number;
}

export const pineconeIndex = pc.index<ReviewRecordMetadata>({ name: process.env["PINECONE_INDEX_NAME"]! });

export default pc;
