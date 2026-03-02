import { DialogTitle, DialogContent, DialogActions, Button, TextField, Rating, Typography, CircularProgress, Box, Stack, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useReviewForm } from "../../hooks/useReviewForm";
import useModalContext from "../../context/ModalContext/hook";
import { type Booking, type BookingDetail } from "../../features/booking/types/Booking";
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

const BookingInfo = ({ booking }: { booking: Booking }) => (
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

const ReviewModal = ({ accommodationId, bookingId, parentId, onSuccess, booking }: ReviewModalProps) => {
	const { closeModal } = useModalContext();

	const { comment, setComment, star, setStar, images, setImages, loading, error, isReply, handleSubmit } = useReviewForm({
		accommodationId,
		bookingId,
		parentId,
		onSuccess: () => {
			onSuccess?.();
			closeModal();
		},
	});

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files) return;

		const selected = Array.from(e.target.files);

		// limit to 10 images
		setImages((prev) => [...prev, ...selected].slice(0, 10));
	};

	const removeImage = (index: number) => {
		setImages((prev) => prev.filter((_, i) => i !== index));
	};

	return (
		<>
			<DialogTitle>{isReply ? "Reply to Review" : "Write a Review"}</DialogTitle>

			<DialogContent dividers>
				{booking && !isReply && <BookingInfo booking={booking} />}

				{!isReply && <Rating value={star} onChange={(_, newValue) => setStar(newValue)} sx={{ mb: 2 }} />}

				<TextField label={isReply ? "Reply" : "Comment"} multiline minRows={3} fullWidth value={comment} onChange={(e) => setComment(e.target.value)} sx={{ mb: 2 }} />

				{/* Image Upload */}
				<Button variant="outlined" component="label" sx={{ mb: 2 }}>
					Add Photos (Max 10)
					<input type="file" hidden multiple accept="image/*" onChange={handleImageChange} />
				</Button>

				{/* Preview */}
				<Stack direction="row" spacing={2} flexWrap="wrap">
					{images.map((file, index) => (
						<Box key={index} position="relative">
							<img src={URL.createObjectURL(file)} alt="preview" width={80} height={80} style={{ objectFit: "cover", borderRadius: 8 }} />
							<IconButton
								size="small"
								onClick={() => removeImage(index)}
								sx={{
									position: "absolute",
									top: -10,
									right: -10,
									background: "white",
								}}
							>
								<DeleteIcon fontSize="small" />
							</IconButton>
						</Box>
					))}
				</Stack>

				{error && (
					<Typography color="error" sx={{ mt: 2 }}>
						{error}
					</Typography>
				)}
			</DialogContent>

			<DialogActions sx={{ px: 3, py: 2 }}>
				<Button onClick={closeModal} disabled={loading}>
					Cancel
				</Button>
				<Button variant="contained" onClick={handleSubmit} disabled={loading || (!comment.trim() && !star)}>
					{loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : isReply ? "Reply" : "Submit Review"}
				</Button>
			</DialogActions>
		</>
	);
};

export default ReviewModal;
