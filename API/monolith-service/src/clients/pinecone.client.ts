import { EAccommodationType } from "@/generated/enums";
import { Pinecone, RecordMetadata } from "@pinecone-database/pinecone";

const pc = new Pinecone({
	apiKey: process.env["PINECONE_API_KEY"]!,
});

// Mandatory fields
interface BaseMetadata extends RecordMetadata {
	accommodationId: string;
	text: string; // Nội dung đã được vectorize
	lat: number;
	lon: number;
	createdAt: number; // Timestamp để sort nếu cần
}

// Metadata for review
export interface ReviewMetadata extends BaseMetadata {
	type: "review";
	reviewId: string;
	rating: number;
	sentiment: string;
}

// 3. Metadata for accommodation profile
export interface ProfileMetadata extends BaseMetadata {
	type: "accommodation-profile";
	accommodationType: EAccommodationType;
}

export type UnifiedRecordMetadata = ReviewMetadata | ProfileMetadata;

export const pineconeIndex = pc.index<UnifiedRecordMetadata>({ name: process.env["PINECONE_INDEX_NAME"]! });

export default pc;
