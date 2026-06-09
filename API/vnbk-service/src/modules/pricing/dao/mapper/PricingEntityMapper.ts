import { injectable } from "tsyringe";
import { type Holiday as PrismaHoliday, type Prisma } from "@/generated/client";
import { EItemType } from "@/modules/pricing/enums/EItemType";
import { Money } from "@/modules/pricing/domain/Money";
import { Holiday } from "@/modules/pricing/domain/Holiday";
import { HolidayOptIn } from "@/modules/pricing/domain/HolidayOptIn";
import { PriceableItem } from "@/modules/pricing/domain/PriceableItem";
import type { DynamicPricingSettings } from "@/modules/pricing/domain/DynamicPricingSettings";

/** A Room row joined to its accommodation (only the columns pricing needs). */
type RoomWithAccommodation = {
	id: string;
	name: string;
	basePrice: Prisma.Decimal;
	floorPrice: Prisma.Decimal;
	pricingType: string;
	accommodationId: string;
	accommodation: { id: string; dynamicPricingSettings: Prisma.JsonValue | null };
};

/** A Bed row joined through its room to the accommodation. */
type BedWithRoom = {
	id: string;
	name: string;
	price: Prisma.Decimal | null;
	room: {
		pricingType: string;
		accommodationId: string;
		accommodation: { id: string; dynamicPricingSettings: Prisma.JsonValue | null };
	};
};

/** A holiday opt-in row (owner or accommodation — identical shape). */
type HolidayOptInRow = {
	id: string;
	holidayCode: string;
	priceMultiplier: Prisma.Decimal;
	preDays: number;
	postDays: number;
	enabled: boolean;
};

/**
 * Maps Prisma entities to pricing domain models. DAO-only; the sole place
 * (besides the DAO) that touches `@/generated/client` and `Prisma.Decimal`.
 * Decimal columns become `Money` (their exact string is preserved).
 */
@injectable()
export class PricingEntityMapper {
	private resolveSettings(raw: Prisma.JsonValue | null | undefined): DynamicPricingSettings | null {
		if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
		return raw as DynamicPricingSettings;
	}

	public roomToPriceableItem(room: RoomWithAccommodation): PriceableItem {
		return new PriceableItem({
			itemType: EItemType.ROOM,
			itemId: room.id,
			name: room.name,
			basePrice: Money.of(room.basePrice.toString()),
			floorPrice: Money.of(room.floorPrice.toString()),
			accommodationId: room.accommodation.id,
			dynamicPricingSettings: this.resolveSettings(room.accommodation.dynamicPricingSettings),
			pricingTypePerNight: room.pricingType === "PER_NIGHT",
		});
	}

	public bedToPriceableItem(bed: BedWithRoom): PriceableItem {
		// Caller guarantees bed.price is present.
		return new PriceableItem({
			itemType: EItemType.BED,
			itemId: bed.id,
			name: bed.name,
			basePrice: Money.of(bed.price!.toString()),
			floorPrice: null,
			accommodationId: bed.room.accommodation.id,
			dynamicPricingSettings: this.resolveSettings(bed.room.accommodation.dynamicPricingSettings),
			pricingTypePerNight: bed.room.pricingType === "PER_NIGHT",
		});
	}

	public holidayToDomain(entity: PrismaHoliday): Holiday {
		return new Holiday({
			id: entity.id,
			name: entity.name,
			code: entity.code,
			date: entity.date,
			isRecurring: entity.isRecurring,
		});
	}

	public optInToDomain(row: HolidayOptInRow): HolidayOptIn {
		return new HolidayOptIn({
			id: row.id,
			holidayCode: row.holidayCode,
			priceMultiplier: Money.of(row.priceMultiplier.toString()),
			preDays: row.preDays,
			postDays: row.postDays,
			enabled: row.enabled,
		});
	}
}
