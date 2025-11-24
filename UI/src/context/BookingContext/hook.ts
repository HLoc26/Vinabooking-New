import { useContext } from "react";
import BookingContext from "./context";

const useBookingContextProvider = () => {
	const ctx = useContext(BookingContext);
	if (!ctx) {
		throw new Error("useBookingContextProvider must be used within BookingContextProvider");
	}
	return ctx;
};

export default useBookingContextProvider;
