import { DialogTitle, DialogContent, DialogActions, Button, TextField, Rating, Typography, CircularProgress, Box, Stack } from "@mui/material";
import { useReviewForm } from "../../hooks/useReviewForm";
import useModalContext from "../../context/ModalContext/hook";
import { type Booking, type BookingDetail } from "../../features/user/types/Booking";
import { CalendarMonthOutlined, KingBedOutlined } from "@mui/icons-material";
import { formatDate } from "../../utils/dateFormatter";
import useRooms from "../../features/accommodation/hooks/useRooms";

interface ReviewModalProps {
	accommodationId: string;
	bookingId?: string | null;
	parentId?: string | null;
	onSuccess?: () => void;
	booking?: Booking;
}

const RoomItem = ({ detail }: { detail: BookingDetail }) => {
	const { data: room } = useRooms([detail.itemId]);
	return (
		<Stack direction="row" spacing={1} alignItems="center">
			<KingBedOutlined fontSize="small" />
			<Typography variant="body2">{room?.[0].name || "..."}</Typography>
		</Stack>
	);
};

const BookingInfo = ({ booking }: { booking: Booking }) => {
	return (
		<Box mb={2} p={2} border="1px solid" borderColor="grey.300" borderRadius={2}>
			<Typography variant="subtitle2" fontWeight={600} mb={1}>
				You are reviewing your stay for:
			</Typography>
			<Stack spacing={1}>
				<Stack direction="row" spacing={1} alignItems="center">
					<CalendarMonthOutlined fontSize="small" />
					<Typography variant="body2">
						{formatDate(booking.startDate.toString())} - {formatDate(booking.endDate.toString())}
					</Typography>
				</Stack>
				{booking.details.map((detail) => (
					<RoomItem key={detail.id} detail={detail} />
				))}
			</Stack>
		</Box>
	);
};

const ReviewModal = ({ accommodationId, bookingId, parentId, onSuccess, booking }: ReviewModalProps) => {
	const { closeModal } = useModalContext();

	const { comment, setComment, star, setStar, loading, error, isReply, handleSubmit } = useReviewForm({
		accommodationId,
		bookingId,
		parentId,
		onSuccess: () => {
			onSuccess?.();
			closeModal();
		},
	});

	const handleConfirm = () => {
		handleSubmit();
	};

	return (
		<>
			<DialogTitle>{isReply ? "Reply to Review" : "Write a Review"}</DialogTitle>

			<DialogContent dividers>
				{booking && !isReply && <BookingInfo booking={booking} />}

				{!isReply && <Rating value={star} onChange={(_e, newValue) => setStar(newValue)} sx={{ mb: 2 }} />}

				<TextField label={isReply ? "Reply" : "Comment"} multiline minRows={3} fullWidth value={comment} onChange={(e) => setComment(e.target.value)} sx={{ mb: 2 }} />

				{error && (
					<Typography color="error" sx={{ mb: 1 }}>
						{error}
					</Typography>
				)}
			</DialogContent>

			<DialogActions sx={{ px: 3, py: 2 }}>
				<Button onClick={closeModal} color="inherit" disabled={loading}>
					Cancel
				</Button>
				<Button variant="contained" color="primary" onClick={handleConfirm} disabled={loading || (!comment.trim() && !star)}>
					{loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : isReply ? "Reply" : "Submit Review"}
				</Button>
			</DialogActions>
		</>
	);
};

export default ReviewModal;
