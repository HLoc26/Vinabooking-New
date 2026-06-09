import { Booking as PrismaBooking, BookingDetail as PrismaBookingDetail, Prisma, EBookingStatus as PrismaBookingStatus, ECancellationSource as PrismaCancellationSource, EItemType as PrismaItemType } from "@/generated/client";
import { Booking, BookingDetail, BookingStatus, CancellationSource, BookingItemType, PricingSnapshot } from "@/models/booking";

type PrismaBookingWithDetails = PrismaBooking & { details?: PrismaBookingDetail[] };

class BookingMapper {
	public static toDomain(prismaBooking: PrismaBookingWithDetails): Booking {
		const builder = Booking.builder()
			.setId(prismaBooking.id)
			.setDates(prismaBooking.startDate, prismaBooking.endDate)
			.setGuestCount(prismaBooking.guestCount)
			.setContactInfo(prismaBooking.leaderName, prismaBooking.leaderEmail, prismaBooking.phone)
			.setReferenceNo(prismaBooking.referenceNo)
			.setUserId(prismaBooking.userId)
			.setCreatedAt(prismaBooking.createdAt)
			.setUpdatedAt(prismaBooking.updatedAt);

		// Safely handle Pricing
		const totalPrice = prismaBooking.totalPrice ? Number(prismaBooking.totalPrice) : null;
		const pricingSnapshot = prismaBooking.pricingSnapshot ? (prismaBooking.pricingSnapshot as PricingSnapshot) : null;
		builder.setPricing(totalPrice, pricingSnapshot);

		// Map Status
		builder.setStatus(prismaBooking.status as unknown as BookingStatus);

		// Map Cancellation info
		builder.setCancellationInfo(
			prismaBooking.note,
			prismaBooking.noteBy ? (prismaBooking.noteBy as unknown as CancellationSource) : null
		);

		// Details
		if (prismaBooking.details) {
			const domainDetails = prismaBooking.details.map((detail) => this.toDomainDetail(detail));
			builder.setDetails(domainDetails);
		}

		return builder.build();
	}

	public static toDomainDetail(prismaDetail: PrismaBookingDetail): BookingDetail {
		return BookingDetail.builder()
			.setId(prismaDetail.id)
			.setCount(prismaDetail.count)
			.setNote(prismaDetail.note)
			.setBookingId(prismaDetail.bookingId)
			.setItemId(prismaDetail.itemId)
			.setItemType(prismaDetail.itemType as unknown as BookingItemType)
			.setCreatedAt(prismaDetail.createdAt)
			.setUpdatedAt(prismaDetail.updatedAt)
			.build();
	}

	public static toPersistence(domainBooking: Booking): PrismaBooking {
		return {
			id: domainBooking.getId(),
			startDate: domainBooking.getStartDate(),
			endDate: domainBooking.getEndDate(),
			guestCount: domainBooking.getGuestCount(),
			leaderName: domainBooking.getLeaderName(),
			leaderEmail: domainBooking.getLeaderEmail(),
			totalPrice: domainBooking.getTotalPrice() !== null ? new Prisma.Decimal(domainBooking.getTotalPrice() as number) : null,
			pricingSnapshot: domainBooking.getPricingSnapshot() ? (domainBooking.getPricingSnapshot() as unknown as Prisma.JsonValue) : null,
			phone: domainBooking.getPhone(),
			referenceNo: domainBooking.getReferenceNo(),
			status: domainBooking.getStatus() as unknown as PrismaBookingStatus,
			note: domainBooking.getNote(),
			noteBy: domainBooking.getNoteBy() ? (domainBooking.getNoteBy() as unknown as PrismaCancellationSource) : null,
			userId: domainBooking.getUserId(),
			createdAt: domainBooking.getCreatedAt(),
			updatedAt: domainBooking.getUpdatedAt(),
		};
	}

	public static toPersistenceDetail(domainDetail: BookingDetail): PrismaBookingDetail {
		return {
			id: domainDetail.getId(),
			count: domainDetail.getCount(),
			note: domainDetail.getNote(),
			bookingId: domainDetail.getBookingId(),
			itemId: domainDetail.getItemId(),
			itemType: domainDetail.getItemType() as unknown as PrismaItemType,
			createdAt: domainDetail.getCreatedAt(),
			updatedAt: domainDetail.getUpdatedAt(),
		};
	}
}

export default BookingMapper;
