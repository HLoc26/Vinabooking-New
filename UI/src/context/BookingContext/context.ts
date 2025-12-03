import { createContext } from "react";
import type { BookingContextInfo } from "../../types/BookingContextInfo";

export interface BookingContextType {
	bookingInfo: BookingContextInfo;
	updateBookingInfo: <K extends keyof BookingContextInfo>(key: K, value: BookingContextInfo[K]) => void;
	updateRoomQuantity: (roomId: string, count: number) => void;
}

const BookingContext = createContext<BookingContextType | null>(null);

export default BookingContext;
