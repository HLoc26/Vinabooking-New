import { EntityType } from "@/models/image";
import ReviewRepository from "@/repositories/review.repository";
import UserService from "./user.service";
import { AccommodationService, BookingService, ImageService } from "@/services";
import { NotFoundError, ForbiddenError, BadRequestError } from "@/errors";
import { EEntityType } from "@/generated/client";
import { Review, ReviewBuilder } from "@/models/review";
import { BookingStatus } from "@/models/booking";
import { CreateReviewPayload } from "@/dto/request/review.dto";
import { ReviewResponse } from "@/dto/response/review.dto";
import { reviewQueue } from "@/clients/queue.client";
import { EReviewJobName } from "@/types/queue.types";
import redisClient from "@/clients/redis.client";

// Định nghĩa Config Interface cho Dependency Injection
export interface ReviewServiceConfig {
	reviewRepository: ReviewRepository;
	userService: UserService;
	bookingService: BookingService;
	imageService: ImageService;
	accommodationService: AccommodationService;
}

class ReviewService {
	readonly #reviewRepository: ReviewRepository;
	readonly #userService: UserService;
	readonly #bookingService: BookingService;
	readonly #imageService: ImageService;
	readonly #accommodationService: AccommodationService;

	constructor(config: ReviewServiceConfig) {
		this.#reviewRepository = config.reviewRepository;
		this.#userService = config.userService;
		this.#bookingService = config.bookingService;
		this.#imageService = config.imageService;
		this.#accommodationService = config.accommodationService;
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
		if (booking.getUserId() !== userId) {
			throw new ForbiddenError("You can only review your own bookings.");
		}

		// 3. Validate trạng thái (Chỉ cho review khi đã hoàn thành)
		if (booking.getStatus() !== BookingStatus.COMPLETED) {
			throw new ForbiddenError("You can only review after the booking is completed.");
		}

		// 4. Validate Accommodation ID
		if (!dto.accommodationId) {
			throw new BadRequestError("Accommodation ID is required.");
		}

		const reviewDomain = new ReviewBuilder()
			.setUserId(userId)
			.setAccommodationId(dto.accommodationId)
			.setBookingId(dto.bookingId)
			.setComment(dto.comment)
			.setStar(dto.star ?? null)
			.build();

		const created = await this.#reviewRepository.create(reviewDomain);

		const { lat, lon } = await this.#getAccommodationCoords(dto.accommodationId);

		await this.#startProcessToVector(created, lat, lon);
		await this.#startSummary(created);

		return created;
	}

	async #getAccommodationCoords(accommodationId: string) {
		await redisClient.INCR(`accommodation:${accommodationId}:review:count`);

		const cacheKey = `accommodation:${accommodationId}:coords`;
		const cached = await redisClient.GET(cacheKey);

		if (cached) {
			return JSON.parse(cached) as { lat: number; lon: number };
		}

		const accommodation = await this.#accommodationService.getAccommodationById(accommodationId);

		const coords = {
			lat: Number(accommodation.address?.latitude || 0),
			lon: Number(accommodation.address?.longitude || 0),
		};

		if (coords.lat !== 0 || coords.lon !== 0) {
			await redisClient.SET(cacheKey, JSON.stringify(coords), {
				EX: 604800, // 7 days
			});
		} else {
			console.warn(`Data anomaly: Accommodation ${accommodationId} has reviews but no coordinates.`);
		}

		return coords;
	}

	async #startSummary(created: Review) {
		await reviewQueue.add(
			EReviewJobName.SUMMARIZE_REVIEWS,
			{
				accommodationId: created.getAccommodationId(),
			},
			{
				jobId: `summary-${created.getAccommodationId()}-${Math.floor(Date.now() / (60 * 60 * 1000))}`,
			}
		);
	}

	async #startProcessToVector(created: Review, lat: number, lon: number) {
		await reviewQueue.add(
			EReviewJobName.PROCESS_TO_VECTORS,
			{
				reviewId: created.getId(),
				accommodationId: created.getAccommodationId(),
				text: created.getComment(),
				rating: created.getStar() ?? 0,
				lat,
				lon,
				createdAt: created.getCreatedAt().getTime(),
			},
			{
				jobId: `review-${created.getId()}`,
			}
		);
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
		const accommodation = await this.#accommodationService.getAccommodationById(parent.getAccommodationId());
		if (accommodation.ownerId !== userId) {
			throw new ForbiddenError("You can only reply to reviews for your own accommodations.");
		}

		const replyDomain = new ReviewBuilder()
			.setUserId(userId)
			.setAccommodationId(parent.getAccommodationId())
			.setParentId(dto.parentId)
			.setComment(dto.comment)
			.build();

		return this.#reviewRepository.create(replyDomain);
	}

	/**
	 * Lấy Reviews của Accommodation (Enrich thêm User Info)
	 */
	public async getReviewsByAccommodation(accommodationId: string): Promise<ReviewResponse[]> {
		const rawReviews = await this.#reviewRepository.findByAccommodationId(accommodationId);
		if (!rawReviews.length) return [];

		const reviews = rawReviews.flatMap((r: Review) => [r, ...r.getReplies()]);
		const userIds = [...new Set(reviews.map((r) => r.getUserId()))];

		const usersData = await Promise.all(
			userIds.map(async (id) => {
				const user = await this.#userService.getUserById(id);
				if (!user) return null;
				const images = await this.#imageService.getImage(EntityType.USER_PROFILE, id);
				const avatar = images.find((i) => i.references.some((r) => r.isPrimary))?.url || ""; // Lấy URL string
				return { id: user.id, name: user.name, avatar };
			})
		);

		const userMap = new Map<string, { id: string; name: string; avatar: string }>();
		usersData.forEach((u) => {
			if (u) userMap.set(u.id, u);
		});
		const formatReview = (review: Review): ReviewResponse => {
			const userData = userMap.get(review.getUserId());
			return {
				id: review.getId(),
				star: review.getStar() ?? 0,
				comment: review.getComment(),
				bookingId: review.getBookingId(),
				commentDate: review.getCreatedAt(),
				user: userData || { id: review.getUserId(), name: "Unknown", avatar: "" },
				children: [], // Sẽ fill sau
			};
		};
		const parentReviews: ReviewResponse[] = reviews.filter((r) => !r.getParentId()).map(formatReview);

		const childReviews = reviews.filter((r) => r.getParentId()).map(formatReview);

		return parentReviews.map((parent) => {
			parent.children = childReviews.filter((child) => reviews.find((r) => r.getId() === child.id)?.getParentId() === parent.id);
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
		return this.#reviewRepository.findRecentParentReviews(accommodationId, top);
	}
}

export default ReviewService;
