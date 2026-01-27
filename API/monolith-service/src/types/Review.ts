import { Review } from "../../src/generated/client";
import { ReviewUncheckedCreateInput } from "../../src/generated/models";
import { UserPayload } from "./User";

type InputOmit = "createdAt" | "updatedAt" | "replies" | "id" | "userId";

export type CreateReviewPayload = Omit<ReviewUncheckedCreateInput, InputOmit>;

export type CreateReviewInput = Omit<CreateReviewPayload, "parentId" | "bookingId"> & { bookingId: string };

export type CreateReplyInput = Omit<CreateReviewPayload, "parentId" | "bookingId"> & { parentId: string };

export type AccommodationReview = Omit<Review, "parentId"> & { children: AccommodationReply[] } & { user: UserPayload };
export type AccommodationReply = Omit<Review, "star" | "bookingId">;
