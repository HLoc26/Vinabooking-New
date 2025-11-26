import { DialogTitle, DialogContent, DialogActions, Button, TextField, Rating, Typography, CircularProgress } from "@mui/material";
import { useReviewForm } from "../../hooks/useReviewForm";
import useModalContext from "../../context/ModalContext/hook";

interface ReviewModalProps {
	accommodationId: string;
	bookingId?: string | null;
	parentId?: string | null;
	onSuccess?: () => void;
}

const ReviewModal = ({ accommodationId, bookingId, parentId, onSuccess }: ReviewModalProps) => {
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
