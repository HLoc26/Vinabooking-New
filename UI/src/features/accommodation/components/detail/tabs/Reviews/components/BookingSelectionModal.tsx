import { DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemButton, ListItemText, Typography, Stack, Pagination } from "@mui/material";
import type { Booking, BookingDetail } from "../../../../../../user/types/Booking";
import useModalContext from "../../../../../../../context/ModalContext/hook";
import { formatDate } from "../../../../../../../utils/dateFormatter";
import { CalendarMonthOutlined, KingBedOutlined } from "@mui/icons-material";
import { useState } from "react";
import useRooms from "../../../../../hooks/useRooms";

interface BookingSelectionModalProps {
	bookings: Booking[];
	onSelect: (booking: Booking) => void;
}

const BOOKINGS_PER_PAGE = 3;

const RoomItem = ({ detail }: { detail: BookingDetail }) => {
	const { data: room } = useRooms([detail.itemId]);
	return (
		<Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
			• {room?.[0].name || "..."}
		</Typography>
	);
};

const BookingListItem = ({ booking, onSelect }: { booking: Booking; onSelect: (booking: Booking) => void }) => {
	const { closeModal } = useModalContext();

	const handleSelect = () => {
		onSelect(booking);
		closeModal();
	};

	return (
		<ListItem disablePadding>
			<ListItemButton onClick={handleSelect} sx={{ alignItems: "flex-start" }}>
				<ListItemText
					primary={
						<Stack direction="row" spacing={2} alignItems="center" mb={1}>
							<CalendarMonthOutlined fontSize="small" />
							<Typography variant="body1">
								{formatDate(booking.startDate.toString())} - {formatDate(booking.endDate.toString())}
							</Typography>
						</Stack>
					}
					secondary={
						<Stack direction="row" spacing={1}>
							<KingBedOutlined fontSize="small" sx={{ mt: 0.5 }} />
							<Stack>
								{booking.details.map((detail) => (
									<RoomItem key={detail.id} detail={detail} />
								))}
							</Stack>
						</Stack>
					}
					secondaryTypographyProps={{ component: "div" }}
				/>
			</ListItemButton>
		</ListItem>
	);
};

const BookingSelectionModal = ({ bookings, onSelect }: BookingSelectionModalProps) => {
	const { closeModal } = useModalContext();
	const [page, setPage] = useState(1);

	const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
		setPage(value);
	};

	const paginatedBookings = bookings.slice((page - 1) * BOOKINGS_PER_PAGE, page * BOOKINGS_PER_PAGE);

	return (
		<>
			<DialogTitle>Choose a booking to review</DialogTitle>
			<DialogContent dividers sx={{ p: 0 }}>
				<List>
					{paginatedBookings.map((booking) => (
						<BookingListItem key={booking.id} booking={booking} onSelect={onSelect} />
					))}
				</List>
			</DialogContent>
			<DialogActions sx={{ justifyContent: "center" }}>
				{bookings.length > BOOKINGS_PER_PAGE && <Pagination count={Math.ceil(bookings.length / BOOKINGS_PER_PAGE)} page={page} onChange={handlePageChange} />}
			</DialogActions>
			<DialogActions>
				<Button onClick={closeModal}>Cancel</Button>
			</DialogActions>
		</>
	);
};

export default BookingSelectionModal;
