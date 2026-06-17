import { Review as PrismaReview, AccommodationReviewSummary as PrismaAccommodationReviewSummary } from "@/generated/client";
import { Review, ReviewBuilder, AccommodationReviewSummary, AccommodationReviewSummaryBuilder } from "@/models/review";

export type PrismaReviewWithReplies = PrismaReview & { replies?: PrismaReview[] };

export class ReviewMapper {
	public static toDomain(prismaReview: PrismaReviewWithReplies): Review {
		let replies: Review[] = [];
		if (prismaReview.replies && prismaReview.replies.length > 0) {
			replies = prismaReview.replies.map((reply) => ReviewMapper.toDomain(reply));
		}

		return new ReviewBuilder()
			.setId(prismaReview.id)
			.setStar(prismaReview.star)
			.setComment(prismaReview.comment)
			.setCreatedAt(prismaReview.createdAt)
			.setUpdatedAt(prismaReview.updatedAt)
			.setUserId(prismaReview.userId)
			.setAccommodationId(prismaReview.accommodationId)
			.setBookingId(prismaReview.bookingId)
			.setParentId(prismaReview.parentId)
			.setReplies(replies)
			.build();
	}

	public static toPersistence(domainReview: Review) {
		return {
			id: domainReview.getId(),
			star: domainReview.getStar(),
			comment: domainReview.getComment(),
			createdAt: domainReview.getCreatedAt(),
			updatedAt: domainReview.getUpdatedAt(),
			userId: domainReview.getUserId(),
			accommodationId: domainReview.getAccommodationId(),
			bookingId: domainReview.getBookingId(),
			parentId: domainReview.getParentId(),
		};
	}
}

export class AccommodationReviewSummaryMapper {
	public static toDomain(prismaSummary: PrismaAccommodationReviewSummary): AccommodationReviewSummary {
		return new AccommodationReviewSummaryBuilder()
			.setId(prismaSummary.id)
			.setContent(prismaSummary.content)
			.setUpdatedAt(prismaSummary.updatedAt)
			.setAccommodationId(prismaSummary.accommodationId)
			.build();
	}

	public static toPersistence(domainSummary: AccommodationReviewSummary) {
		return {
			id: domainSummary.getId(),
			content: domainSummary.getContent(),
			updatedAt: domainSummary.getUpdatedAt(),
			accommodationId: domainSummary.getAccommodationId(),
		};
	}
}
