import { EItemType } from "@/modules/booking/enums/EItemType";

/** Wire representation of a single booking line item. */
export class BookingDetailResponse {
	id!: string;
	itemId!: string;
	itemType!: EItemType;
	count!: number;
	note!: string | null;
}
