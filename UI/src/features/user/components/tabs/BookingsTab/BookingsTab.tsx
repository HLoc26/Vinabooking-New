import { Divider, Stack } from "@mui/material";
import BookingStatsOverview from "./BookingStatsOverview";
import BookingTabsView from "./BookingTabsView";
import useUserBookings from "../../../hooks/useUserBookings";

const BookingTab: React.FC = () => {
	const bookings = useUserBookings();

	return (
		<Stack spacing={3}>
			<BookingStatsOverview bookings={bookings} />
			<Divider variant="inset" />
			<BookingTabsView bookings={bookings} defaultImage="https://placeholders.io/300/300/accommodation?style=photographic" />
		</Stack>
	);
};

export default BookingTab;
