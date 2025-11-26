import { DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemButton, ListItemText, Typography, Stack } from "@mui/material";
import type { Booking, BookingDetail } from "../../features/user/types/Booking";
import useModalContext from "../../context/ModalContext/hook";
import useRoomInfo from "../../features/user/hooks/useRoomInfo";
import { formatDate } from "../../utils/dateFormatter";
import { CalendarMonthOutlined, KingBedOutlined } from "@mui/icons-material";

interface BookingSelectionModalProps {
	bookings: Booking[];
	onSelect: (booking: Booking) => void;
}

const RoomItem = ({ detail }: { detail: BookingDetail }) => {
	const room = useRoomInfo(detail.itemId);
	return (
		<Typography variant="body2" color="text.secondary">
			• {room?.name || "..."}
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

	return (
		<>
			<DialogTitle>Choose a booking to review</DialogTitle>
			<DialogContent dividers>
				<List>
					{bookings.map((booking) => (
						<BookingListItem key={booking.id} booking={booking} onSelect={onSelect} />
					))}
				</List>
			</DialogContent>
			<DialogActions>
				<Button onClick={closeModal}>Cancel</Button>
			</DialogActions>
		</>
	);
};

export default BookingSelectionModal;

