import { useQuery } from "@tanstack/react-query";
import { bookingApi } from "../services/bookingApi";
import type { ItemInfo } from "../types/BookingContextInfo";
import type { QuoteResponse } from "../types/pricing.types";

const toIsoDate = (d: Date | string): string => (typeof d === "string" ? d : d.toISOString());

interface Args {
	startDate: Date | string;
	endDate: Date | string;
	items: ItemInfo[];
}

export const usePreviewQuote = ({ startDate, endDate, items }: Args) => {
	const checkIn = toIsoDate(startDate);
	const checkOut = toIsoDate(endDate);
	const itemsKey = items.map((i) => `${i.itemType}:${i.id}:${i.count}`).join(",");

	return useQuery<QuoteResponse>({
		queryKey: ["pricing-quote", checkIn, checkOut, itemsKey],
		queryFn: () =>
			bookingApi.getQuote({
				checkIn,
				checkOut,
				items: items.map((i) => ({ itemType: i.itemType, itemId: i.id, count: i.count })),
			}),
		enabled: items.length > 0 && !!checkIn && !!checkOut,
		staleTime: 60_000,
	});
};

export default usePreviewQuote;
