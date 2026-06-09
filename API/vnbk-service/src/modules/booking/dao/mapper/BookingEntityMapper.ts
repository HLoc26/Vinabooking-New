import { injectable } from "tsyringe";
import { Prisma } from "@/generated/client";
import { Booking } from "@/modules/booking/domain/Booking";
import { BookingDetail } from "@/modules/booking/domain/BookingDetail";
import { EBookingStatus } from "@/modules/booking/enums/EBookingStatus";
import type { ECancellationSource } from "@/modules/booking/enums/ECancellationSource";
import type { EItemType } from "@/modules/booking/enums/EItemType";
import type { PricingSnapshot } from "@/modules/booking/domain/PricingSnapshot";

/** A Booking row joined to its detail lines. */
type BookingWithDetails = Prisma.BookingGetPayload<{ include: { details: true } }>;
type BookingDetailEntity = BookingWithDetails["details"][number];

/**
 * Maps the Prisma Booking graph (booking + detail lines) to the Booking domain
 * aggregate. DAO-only; the sole place (besides the DAO) that touches
 * `@/generated/client`, `Prisma.Decimal`, and the `pricingSnapshot` JSON.
 * Decimal `totalPrice` becomes a JS number and the Json snapshot is surfaced as
 * a typed `PricingSnapshot`, so no Prisma type leaves the DAO.
 */
@injectable()
export class BookingEntityMapper {
	public toDomain(entity: BookingWithDetails): Booking {
		return Booking.rehydrate({
			id: entity.id,
			status: entity.status as EBookingStatus,
			startDate: entity.startDate,
			endDate: entity.endDate,
			guestCount: entity.guestCount,
			leaderName: entity.leaderName,
			leaderEmail: entity.leaderEmail,
			phone: entity.phone,
			totalPrice: entity.totalPrice === null ? null : Number(entity.totalPrice),
			pricingSnapshot: this.resolveSnapshot(entity.pricingSnapshot),
			referenceNo: entity.referenceNo,
			note: entity.note,
			noteBy: (entity.noteBy ?? null) as ECancellationSource | null,
			userId: entity.userId,
			details: entity.details.map((detail) => this.detailToDomain(detail)),
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt,
		});
	}

	private detailToDomain(entity: BookingDetailEntity): BookingDetail {
		return BookingDetail.rehydrate({
			id: entity.id,
			itemId: entity.itemId,
			itemType: entity.itemType as EItemType,
			count: entity.count,
			note: entity.note,
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt,
		});
	}

	private resolveSnapshot(raw: Prisma.JsonValue | null): PricingSnapshot | null {
		if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
		return raw as unknown as PricingSnapshot;
	}

	public toCreateInput(booking: Booking): Prisma.BookingCreateInput {
		const snapshot = booking.pricingSnapshot;
		return {
			startDate: booking.startDate,
			endDate: booking.endDate,
			guestCount: booking.guestCount,
			leaderName: booking.leaderName,
			leaderEmail: booking.leaderEmail,
			phone: booking.phone,
			totalPrice: booking.totalPrice === null ? null : new Prisma.Decimal(booking.totalPrice),
			pricingSnapshot: snapshot === null ? Prisma.JsonNull : (snapshot as unknown as Prisma.InputJsonValue),
			referenceNo: booking.referenceNo,
			status: booking.status,
			note: booking.note,
			noteBy: booking.noteBy,
			user: { connect: { id: booking.userId } },
			details: {
				create: booking.details.map((detail) => ({
					itemId: detail.itemId,
					itemType: detail.itemType,
					count: detail.count,
					note: detail.note,
				})),
			},
		};
	}

	public toUpdateInput(booking: Booking): Prisma.BookingUpdateInput {
		return {
			status: booking.status,
			note: booking.note,
			noteBy: booking.noteBy,
		};
	}
}
