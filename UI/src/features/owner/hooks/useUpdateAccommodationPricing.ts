import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAccommodationPricingSettings } from "../services/ownerPricingApi";
import type { DynamicPricingSettings, HolidayOptIn } from "../types/pricing.types";

export const useUpdateAccommodationPricing = (accommodationId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: { dynamicPricingSettings?: DynamicPricingSettings | null; holidayOptIns?: HolidayOptIn[] | null }) =>
			updateAccommodationPricingSettings(accommodationId, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["accommodationManage", accommodationId] });
		},
	});
};
