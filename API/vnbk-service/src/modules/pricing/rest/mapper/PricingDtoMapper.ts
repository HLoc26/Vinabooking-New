import { injectable } from "tsyringe";
import type { Holiday } from "@/modules/pricing/domain/Holiday";
import type { HolidayOptIn } from "@/modules/pricing/domain/HolidayOptIn";
import type { OwnerSettings } from "@/modules/pricing/service/IOwnerPricingService";
import { HolidayResponse } from "@/modules/pricing/dto/response/HolidayResponse";
import { HolidayOptInResponse } from "@/modules/pricing/dto/response/HolidayOptInResponse";
import { OwnerSettingsResponse } from "@/modules/pricing/dto/response/OwnerSettingsResponse";

/** Maps pricing domain models to their response DTOs. */
@injectable()
export class PricingDtoMapper {
	public toHolidayResponse(holiday: Holiday): HolidayResponse {
		const response = new HolidayResponse();
		response.id = holiday.id;
		response.name = holiday.name;
		response.code = holiday.code;
		response.date = holiday.date.toISOString();
		response.isRecurring = holiday.isRecurring;
		return response;
	}

	public toHolidayResponses(holidays: Holiday[]): HolidayResponse[] {
		return holidays.map((h) => this.toHolidayResponse(h));
	}

	public toHolidayOptInResponse(optIn: HolidayOptIn): HolidayOptInResponse {
		const response = new HolidayOptInResponse();
		response.id = optIn.id;
		response.holidayCode = optIn.holidayCode;
		response.priceMultiplier = optIn.priceMultiplier.toNumber(2);
		response.preDays = optIn.preDays;
		response.postDays = optIn.postDays;
		response.enabled = optIn.enabled;
		return response;
	}

	public toHolidayOptInResponses(optIns: HolidayOptIn[]): HolidayOptInResponse[] {
		return optIns.map((o) => this.toHolidayOptInResponse(o));
	}

	public toOwnerSettingsResponse(settings: OwnerSettings): OwnerSettingsResponse {
		const response = new OwnerSettingsResponse();
		response.ownerProfileId = settings.ownerProfileId;
		response.dynamicPricingSettings = settings.dynamicPricingSettings;
		return response;
	}
}
