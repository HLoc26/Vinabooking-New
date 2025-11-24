import { Divider, Stack } from "@mui/material";
import BookingStatsOverview from "./BookingStatsOverview";
import { bookings } from "../../../constants/mock";
import BookingTabsView from "./BookingTabsView";

const BookingTab: React.FC = () => {
	return (
		<Stack spacing={3}>
			<BookingStatsOverview bookings={bookings} />
			<Divider variant="inset" />
			<BookingTabsView bookings={bookings} defaultImage="https://placeholders.io/300/300/accommodation?style=photographic" />
		</Stack>
	);
};

export default BookingTab;
