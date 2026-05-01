import ReviewRepository from "@/repositories/review.repository";
import UserService from "./user.service";
import { BookingService, ImageService } from "@/services";
import { NotFoundError, ForbiddenError, BadRequestError } from "@/errors";
import { EEntityType, Prisma, Review } from "@/generated/client";
import { CreateReviewPayload } from "@/types/requests";
import { ReviewResponse } from "@/types/responses/review.response";
import { aiQueue } from "@/clients/queue.client";
import { EReviewJobName } from "@/types/review.types";

// Định nghĩa Config Interface cho Dependency Injection
export interface ReviewServiceConfig {
	reviewRepository: ReviewRepository;
	userService: UserService;
	bookingService: BookingService;
	imageService: ImageService;
}

class ReviewService {
	readonly #reviewRepository: ReviewRepository;
	readonly #userService: UserService;
	readonly #bookingService: BookingService;
	readonly #imageService: ImageService;

	constructor(config: ReviewServiceConfig) {
		this.#reviewRepository = config.reviewRepository;
		this.#userService = config.userService;
		this.#bookingService = config.bookingService;
		this.#imageService = config.imageService;
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

		const created = await this.#reviewRepository.create(data);

		await aiQueue.add(
			EReviewJobName.PROCESS_TO_VECTORS,
			{
				reviewId: created.id,
				accommodationId: created.accommodationId,
				text: created.comment,
				rating: created.star,
			},
			{
				jobId: `review-${created.id}`,
			}
		);

		await aiQueue.add(
			EReviewJobName.SUMMARIZE_REVIEWS,
			{
				accommodationId: created.accommodationId,
				reviewId: created.id,
				text: created.comment,
				rating: created.star,
			},
			{
				jobId: `summary-${created.accommodationId}-${Math.floor(Date.now() / (60 * 60 * 1000))}`,
			}
		);

		return created;
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
	public async getReviewsByAccommodation(accommodationId: string): Promise<ReviewResponse[]> {
		const reviews = await this.#reviewRepository.findByAccommodationId(accommodationId);
		if (!reviews.length) return [];
		const userIds = [...new Set(reviews.map((r) => r.userId))];

		const usersData = await Promise.all(
			userIds.map(async (id) => {
				const user = await this.#userService.getUserById(id);
				if (!user) return null;
				const images = await this.#imageService.getImage(EEntityType.USER_PROFILE, id);
				const avatar = images.find((i) => i.references.some((r) => r.isPrimary))?.url || ""; // Lấy URL string
				return { id: user.id, name: user.name, avatar };
			})
		);

		const userMap = new Map(usersData.filter((u) => u !== null).map((u) => [u!.id, u!]));
		const formatReview = (review: Review): ReviewResponse => {
			const userData = userMap.get(review.userId);
			return {
				id: review.id,
				star: review.star ?? 0,
				comment: review.comment,
				bookingId: review.bookingId,
				commentDate: review.createdAt,
				user: userData || { id: review.userId, name: "Unknown", avatar: "" },
				children: [], // Sẽ fill sau
			};
		};
		const parentReviews: ReviewResponse[] = reviews.filter((r) => !r.parentId).map(formatReview);

		const childReviews = reviews.filter((r) => r.parentId).map(formatReview);

		return parentReviews.map((parent) => {
			parent.children = childReviews.filter((child) => reviews.find((r) => r.id === child.id)?.parentId === parent.id);
			return parent;
		});
	}
	public async getMyReviewByBooking(userId: string, bookingId: string) {
		return this.#reviewRepository.findByBookingAndUser(bookingId, userId);
	}
	public async findByBookingAndUser(bookingId: string, userId: string) {
		return this.#reviewRepository.findByBookingAndUser(bookingId, userId);
	}

	public async getRecentParentReviews(accommodationId: string, top: number): Promise<Review[]> {
		const reviews: Review[] = await this.#reviewRepository.findRecentParentReviews(accommodationId, top);
		return reviews;
	}
}

export default ReviewService;
