import { Review } from "../../generated/prisma/client";
import { ReviewUncheckedCreateInput } from "../../generated/prisma/models";

type InputOmit = "createdAt" | "updatedAt" | "replies" | "id" | "userId";

export type CreateReviewPayload = Omit<ReviewUncheckedCreateInput, InputOmit>;

export type CreateReviewInput = Omit<CreateReviewPayload, "parentId" | "bookingId"> & { bookingId: string };

export type CreateReplyInput = Omit<CreateReviewPayload, "parentId" | "bookingId"> & { parentId: string };

export type AccommodationReview = Omit<Review, "parentId"> & { children: AccommodationReply[] };
export type AccommodationReply = Omit<Review, "star" | "bookingId">;
