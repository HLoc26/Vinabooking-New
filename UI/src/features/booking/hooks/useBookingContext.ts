import { FakeContextInfo } from "../services/context/FakeContextInfo";
import { useContextInfo } from "../hooks/useContextInfo";
import type { BookingContextInfo } from "../types/BookingContextInfo";

export function useBookingContext() {
	const adapter = new FakeContextInfo();
	const context: BookingContextInfo = useContextInfo(adapter.getInfo());
	return { context };
}
