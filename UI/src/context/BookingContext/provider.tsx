import useBookingInfo from "../../hooks/useBookingInfo";
import BookingContext from "./context";

const BookingContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { bookingInfo, updateBookingInfo } = useBookingInfo();

	return <BookingContext.Provider value={{ bookingInfo, updateBookingInfo }}>{children}</BookingContext.Provider>;
};

export default BookingContextProvider;
