import { createContext } from "react";
import useBookingInfo from "../../hooks/useBookingInfo";

const BookingContext = createContext<ReturnType<typeof useBookingInfo> | null>(null);

export default BookingContext;
