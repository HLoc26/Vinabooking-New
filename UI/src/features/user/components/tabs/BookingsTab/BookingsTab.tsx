import { Divider, Stack } from "@mui/material";
import BookingStatsOverview from "./BookingStatsOverview";
import BookingTabsView from "./BookingTabsView";
import useUserBookings from "../../../../booking/hooks/useUserBookings";

const BookingTab: React.FC = () => {
	const bookings = useUserBookings();

	return (
		<Stack spacing={3}>
			<BookingStatsOverview bookings={bookings} />
			<Divider variant="inset" />
			<BookingTabsView bookings={bookings} />
		</Stack>
	);
};

export default BookingTab;
