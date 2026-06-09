import { Money } from "@/modules/pricing/domain/Money";

/**
 * An owner/accommodation holiday opt-in: the multiplier and pre/post window to
 * apply around a holiday anchor. `priceMultiplier` is a Money so the engine
 * compares/multiplies with exact decimal semantics (Anchor + Window model §1.3).
 */
export class HolidayOptIn {
	public readonly id: string;
	public readonly holidayCode: string;
	public readonly priceMultiplier: Money;
	public readonly preDays: number;
	public readonly postDays: number;
	public readonly enabled: boolean;

	public constructor(props: { id: string; holidayCode: string; priceMultiplier: Money; preDays: number; postDays: number; enabled: boolean }) {
		this.id = props.id;
		this.holidayCode = props.holidayCode;
		this.priceMultiplier = props.priceMultiplier;
		this.preDays = props.preDays;
		this.postDays = props.postDays;
		this.enabled = props.enabled;
	}
}
