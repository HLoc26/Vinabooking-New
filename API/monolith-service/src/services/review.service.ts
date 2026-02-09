import ReviewRepository from "@/repositories/review.repository";
import UserService from "./user.service";
import { BookingService } from "@/services";
import { NotFoundError, ForbiddenError, BadRequestError } from "@/errors";
import { Prisma } from "@/generated/client";
import { CreateReviewPayload } from "@/types/requests";

// Định nghĩa Config Interface cho Dependency Injection
export interface ReviewServiceConfig {
	reviewRepository: ReviewRepository;
	userService: UserService;
	bookingService: BookingService;
}

class ReviewService {
	readonly #reviewRepository: ReviewRepository;
	readonly #userService: UserService;
	readonly #bookingService: BookingService;

	constructor(config: ReviewServiceConfig) {
		this.#reviewRepository = config.reviewRepository;
		this.#userService = config.userService;
		this.#bookingService = config.bookingService;
	}

	/**
	 * Tạo Review gốc (Cần check Booking)
	 */
	public async createReview(userId: string, dto: CreateReviewPayload) {
		if (!dto.bookingId) {
			throw new BadRequestError("Booking ID is required for a review.");
		}

		// 1. Gọi BookingService để lấy thông tin booking
		const booking = await this.#bookingService.getBookingById(dto.bookingId);

		// 2. Validate chủ sở hữu booking
		if (booking.userId !== userId) {
			throw new ForbiddenError("You can only review your own bookings.");
		}

		// 3. Validate trạng thái (Chỉ cho review khi đã hoàn thành)
		// Logic cũ: booking.status === "COMPLETED"
		if (booking.status !== "COMPLETED") {
			throw new ForbiddenError("You can only review after the booking is completed.");
		}

		// 4. Validate Accommodation ID
		if (!dto.accommodationId) {
			throw new BadRequestError("Accommodation ID is required.");
		}

		const data: Prisma.ReviewUncheckedCreateInput = {
			userId,
			accommodationId: dto.accommodationId,
			bookingId: dto.bookingId,
			comment: dto.comment,
			star: dto.star,
		};

		return this.#reviewRepository.create(data);
	}

	/**
	 * Tạo Reply
	 */
	public async createReply(userId: string, dto: CreateReviewPayload) {
		if (!dto.parentId) {
			throw new BadRequestError("Parent ID is required for a reply.");
		}

		// 1. Check Parent exists
		const parent = await this.#reviewRepository.findParentById(dto.parentId);
		if (!parent) {
			throw new NotFoundError("Parent review not found or you are trying to reply to a reply.");
		}

		// 2. Create Reply
		const data: Prisma.ReviewUncheckedCreateInput = {
			userId,
			accommodationId: parent.accommodationId,
			parentId: dto.parentId,
			comment: dto.comment,
			// Reply không có star và bookingId
		};

		return this.#reviewRepository.create(data);
	}

	/**
	 * Lấy Reviews của Accommodation (Enrich thêm User Info)
	 */
	public async getReviewsByAccommodation(accommodationId: string) {
		const reviews = await this.#reviewRepository.findByAccommodationId(accommodationId);

		const parents = reviews.filter((r) => !r.parentId);
		const children = reviews.filter((r) => r.parentId);

		const result = await Promise.all(
			parents.map(async (parent) => {
				const parentReplies = children.filter((c) => c.parentId === parent.id);
				const parentUser = await this.#userService.getUserById(parent.userId);

				const enrichedReplies = await Promise.all(
					parentReplies.map(async (reply) => {
						const replyUser = await this.#userService.getUserById(reply.userId);
						return {
							...reply,
							user: replyUser ? { id: replyUser.id, name: replyUser.name, avatar: null } : null,
						};
					})
				);

				return {
					...parent,
					user: parentUser ? { id: parentUser.id, name: parentUser.name, avatar: null } : null,
					children: enrichedReplies,
				};
			})
		);

		return result;
	}
}

export default ReviewService;
