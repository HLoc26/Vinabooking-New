import type { BookingContextInfo } from "../../../types/BookingContextInfo";

export interface ContextInfoAdapter {
	getInfo(): BookingContextInfo;
}
