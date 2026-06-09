import type { EItemType } from "@/modules/pricing/enums/EItemType";
import { Money } from "@/modules/pricing/domain/Money";
import type { DynamicPricingSettings } from "@/modules/pricing/domain/DynamicPricingSettings";

/**
 * A bookable item (Room or Bed) resolved for pricing. The DAO joins through to
 * the owning accommodation and surfaces exactly the fields the engine needs:
 * the base/floor price, the pricing model, and the accommodation's dynamic
 * pricing settings + id (the latter keys the per-accommodation holiday map).
 *
 * Beds have no floor price and always carry the room's pricing type.
 */
export class PriceableItem {
	public readonly itemType: EItemType;
	public readonly itemId: string;
	public readonly name: string;
	public readonly basePrice: Money;
	public readonly floorPrice: Money | null;
	public readonly accommodationId: string;
	public readonly dynamicPricingSettings: DynamicPricingSettings | null;
	public readonly pricingTypePerNight: boolean;

	public constructor(props: {
		itemType: EItemType;
		itemId: string;
		name: string;
		basePrice: Money;
		floorPrice: Money | null;
		accommodationId: string;
		dynamicPricingSettings: DynamicPricingSettings | null;
		pricingTypePerNight: boolean;
	}) {
		this.itemType = props.itemType;
		this.itemId = props.itemId;
		this.name = props.name;
		this.basePrice = props.basePrice;
		this.floorPrice = props.floorPrice;
		this.accommodationId = props.accommodationId;
		this.dynamicPricingSettings = props.dynamicPricingSettings;
		this.pricingTypePerNight = props.pricingTypePerNight;
	}
}
