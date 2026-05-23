import apiClient from "../../../services/apiClient";
import type { ApiResponse } from "../../../types/Response";
import type {
	DynamicPricingSettings,
	HolidayDto,
	HolidayOptIn,
	OwnerHolidayRow,
	OwnerSettingsResponse,
	QuoteItemInput,
	QuoteResponse,
} from "../types/pricing.types";

// Public catalog
export const getHolidayCatalog = async () =>
	apiClient.get<ApiResponse<HolidayDto[]>>("/pricing/holidays").then((r) => r.data.data ?? []);

// Owner-wide settings
export const getOwnerSettings = async () =>
	apiClient.get<ApiResponse<OwnerSettingsResponse>>("/pricing/owners/me/settings").then((r) => {
		if (!r.data.success || !r.data.data) throw new Error(r.data.error || "Failed to fetch owner settings");
		return r.data.data;
	});

export const updateOwnerSettings = async (settings: DynamicPricingSettings | null) =>
	apiClient.patch<ApiResponse<OwnerSettingsResponse>>("/pricing/owners/me/settings", settings).then((r) => {
		if (!r.data.success || !r.data.data) throw new Error(r.data.error || "Failed to update owner settings");
		return r.data.data;
	});

// Owner-wide holiday opt-ins
export const getOwnerHolidays = async () =>
	apiClient.get<ApiResponse<OwnerHolidayRow[]>>("/pricing/owners/me/holidays").then((r) => r.data.data ?? []);

export const replaceOwnerHolidays = async (items: HolidayOptIn[]) =>
	apiClient.put<ApiResponse<OwnerHolidayRow[]>>("/pricing/owners/me/holidays", { items }).then((r) => {
		if (!r.data.success || !r.data.data) throw new Error(r.data.error || "Failed to update holidays");
		return r.data.data;
	});

export const syncAllAccommodations = async () =>
	apiClient.post<ApiResponse<{ updatedCount: number }>>("/pricing/owners/me/sync-accommodations").then((r) => {
		if (!r.data.success || !r.data.data) throw new Error(r.data.error || "Failed to sync accommodations");
		return r.data.data;
	});

// Per-accommodation settings (edit endpoint — backend ready in this PR; FE-side edit page is teammate's scope)
export const updateAccommodationPricingSettings = async (
	accommodationId: string,
	payload: { dynamicPricingSettings?: DynamicPricingSettings | null; holidayOptIns?: HolidayOptIn[] | null }
) =>
	apiClient
		.patch<ApiResponse<unknown>>(`/owners/accommodations/${accommodationId}/pricing-settings`, payload)
		.then((r) => {
			if (!r.data.success) throw new Error(r.data.error || "Failed to update accommodation pricing");
		});

// Quote (public)
export const requestQuote = async (input: {
	checkIn: string;
	checkOut: string;
	items: QuoteItemInput[];
}) =>
	apiClient.post<ApiResponse<QuoteResponse>>("/pricing/quote", input).then((r) => {
		if (!r.data.success || !r.data.data) throw new Error(r.data.error || "Failed to fetch quote");
		return r.data.data;
	});
