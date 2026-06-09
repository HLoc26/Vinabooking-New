import { EViewType } from "@/modules/room/enums/EViewType";
import { EPricingType } from "@/modules/room/enums/EPricingType";
import { BedResponse } from "@/modules/room/dto/response/BedResponse";
import { AmenityResponse } from "@/modules/room/dto/response/AmenityResponse";
import type { ImageResponse } from "@/modules/image";
import type { QuoteItemPricingResponse } from "@/modules/pricing";

/**
 * Wire (and cross-module) representation of a room with its beds, amenities, and
 * attached images. The accommodation module embeds this in its detail aggregation.
 *
 * `pricing` is populated only when the read was made with a check-in/check-out
 * window (a price preview via the pricing engine). `images` is attached from the
 * image module. Decimal columns (`size`, `basePrice`, `floorPrice`, bed `price`)
 * are surfaced as JS numbers.
 *
 * NOTE: `remainingQuantity` / availability is NOT included here — it is computed
 * by the booking module (which depends on room) to keep the module graph acyclic.
 */
export class RoomResponse {
	id!: string;
	accommodationId!: string;
	name!: string;
	description!: string | null;
	quantity!: number;
	maxAdults!: number;
	maxChildren!: number;
	size!: number | null;
	bedroomCount!: number;
	bathroomCount!: number;
	viewType!: EViewType;
	viewDescription!: string | null;
	basePrice!: number;
	floorPrice!: number;
	pricingType!: EPricingType;
	isActive!: boolean;
	beds!: BedResponse[];
	amenities!: AmenityResponse[];
	images!: ImageResponse[];
	pricing?: QuoteItemPricingResponse;
}
