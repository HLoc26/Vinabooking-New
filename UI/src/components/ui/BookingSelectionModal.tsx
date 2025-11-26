import { DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemButton, ListItemText, Typography, Stack } from "@mui/material";
import { type Booking } from "../../features/user/types/Booking";
import useModalContext from "../../context/ModalContext/hook";
import useRoomInfo from "../../features/user/hooks/useRoomInfo";
import { formatDate } from "../../utils/dateFormatter";
import { CalendarMonthOutlined, KingBedOutlined } from "@mui/icons-material";

interface BookingSelectionModalProps {
	bookings: Booking[];
	onSelect: (booking: Booking) => void;
}

const BookingListItem = ({ booking, onSelect }: { booking: Booking; onSelect: (booking: Booking) => void }) => {
	const { closeModal } = useModalContext();
	const roomId = booking.details?.[0]?.itemId || null;
	const room = useRoomInfo(roomId ?? "");

	const handleSelect = () => {
		onSelect(booking);
		closeModal();
	};

	return (
		<ListItem disablePadding>
			<ListItemButton onClick={handleSelect}>
				<ListItemText
					primary={
						<Stack direction="row" spacing={2} alignItems="center">
							<CalendarMonthOutlined fontSize="small" />
							<Typography variant="body1">
								{formatDate(booking.startDate.toString())} - {formatDate(booking.endDate.toString())}
							</Typography>
						</Stack>
					}
					secondary={
						<Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
							<KingBedOutlined fontSize="small" />
							<Typography variant="body2" color="text.secondary">
								{room?.name || "..."}
							</Typography>
						</Stack>
					}
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

