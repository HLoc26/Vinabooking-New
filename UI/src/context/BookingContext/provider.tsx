import useBookingInfo from "../../hooks/useBookingInfo";
import BookingContext from "./context";

const BookingContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const bookingInfo = useBookingInfo();

	return <BookingContext.Provider value={bookingInfo}>{children}</BookingContext.Provider>;
};

export default BookingContextProvider;
