import type { DynamicPricingSettings } from "@/modules/pricing/domain/DynamicPricingSettings";

/** The owner's profile id plus its current dynamic-pricing settings (may be null). */
export class OwnerSettingsResponse {
	ownerProfileId!: string;
	dynamicPricingSettings!: DynamicPricingSettings | null;
}
