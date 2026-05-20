import { useState, memo } from "react";
import { Box, Typography, Rating, Avatar, Button, Stack, CircularProgress, TextField } from "@mui/material";
import { ReplyOutlined, Send } from "@mui/icons-material";
import type { ReviewWithImages } from "../../../../review/types/review.types";
import { getThumbnailUrls } from "../../../../../utils/image";

interface ReviewItemProps {
	review: ReviewWithImages;
	onReplySubmit: (parentId: string, text: string) => Promise<void>;
	onOpenGallery: (urls: string[], idx: number) => void;
}

const ReviewItemComponent = ({ review, onReplySubmit, onOpenGallery }: ReviewItemProps) => {
	const [isReplying, setIsReplying] = useState(false);
	const [replyText, setReplyText] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const hasReply = review.children && review.children.length > 0;

	const handleSave = async () => {
		if (!replyText.trim()) return;
		setIsSubmitting(true);
		await onReplySubmit(review.id, replyText);
		setIsSubmitting(false);
		setIsReplying(false);
		setReplyText("");
	};

	return (
		<Box sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(255,255,255,0.08)", transition: "all 0.2s", "&:hover": { bgcolor: "rgba(255,255,255,0.01)" } }}>
			<Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
				<Box sx={{ display: "flex", gap: 1.5 }}>
					<Avatar src={review.user?.avatar} sx={{ width: 40, height: 40, bgcolor: "secondary.main" }}>
						{review.user?.name?.charAt(0).toUpperCase() || "U"}
					</Avatar>
					<Box>
						<Typography variant="subtitle2" fontWeight={700}>
							{review.user?.name || "Anonymous Guest"}
						</Typography>
						<Typography variant="caption" color="text.disabled">
							{new Date(review.commentDate || Date.now()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
						</Typography>
					</Box>
				</Box>
				<Rating value={review.star} readOnly size="small" />
			</Box>

			<Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
				{review.comment}
			</Typography>

			{review.images && review.images.length > 0 && (
				<Stack direction="row" spacing={1.5} mt={2} mb={1} flexWrap="wrap">
					{getThumbnailUrls(review.images).map((imgUrl: string, index: number) => (
						<Box
							key={imgUrl}
							onClick={() =>
								onOpenGallery(
									review.images.map((img: { url: string }) => img.url),
									index
								)
							}
							sx={{
								width: 80,
								height: 80,
								borderRadius: 2,
								overflow: "hidden",
								cursor: "pointer",
								border: "1px solid rgba(255,255,255,0.1)",
								transition: "transform 0.2s",
								"&:hover": { transform: "scale(1.05)", borderColor: "primary.main" },
							}}
						>
							<img src={imgUrl} alt="Guest upload" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
						</Box>
					))}
				</Stack>
			)}

			{hasReply ? (
				<Box sx={{ mt: 2, ml: 4, p: 2, bgcolor: "rgba(var(--mui-palette-primary-mainChannel) / 0.05)", borderLeft: "3px solid", borderColor: "primary.main", borderRadius: "0 8px 8px 0" }}>
					<Box display="flex" justifyContent="space-between" mb={0.5}>
						<Typography variant="caption" fontWeight={700} color="primary.main">
							Your Response
						</Typography>
						<Typography variant="caption" color="text.disabled">
							{new Date(review.children[0].commentDate || Date.now()).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
						</Typography>
					</Box>
					<Typography variant="body2" color="text.secondary" fontStyle="italic">
						{review.children[0].comment}
					</Typography>
				</Box>
			) : (
				<Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}>
					{isReplying ? (
						<Box sx={{ width: "100%", mt: 1, p: 2, bgcolor: "rgba(255,255,255,0.02)", borderRadius: 2, border: "1px solid rgba(255,255,255,0.05)" }}>
							<TextField
								fullWidth
								multiline
								rows={3}
								placeholder="Write a polite and professional response..."
								variant="outlined"
								size="small"
								value={replyText}
								onChange={(e) => setReplyText(e.target.value)}
								sx={{ mb: 1.5, "& .MuiOutlinedInput-root": { bgcolor: "background.paper", borderRadius: 2 } }}
							/>
							<Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
								<Button size="small" color="inherit" onClick={() => setIsReplying(false)} sx={{ textTransform: "none", fontWeight: 600 }}>
									Cancel
								</Button>
								<Button
									size="small"
									variant="contained"
									color="primary"
									onClick={handleSave}
									disabled={!replyText.trim() || isSubmitting}
									startIcon={isSubmitting ? <CircularProgress size={14} color="inherit" /> : <Send fontSize="small" />}
									sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
								>
									Post Reply
								</Button>
							</Box>
						</Box>
					) : (
						<Button
							size="small"
							variant="text"
							color="inherit"
							startIcon={<ReplyOutlined fontSize="small" />}
							onClick={() => setIsReplying(true)}
							sx={{ textTransform: "none", fontWeight: 600, color: "text.secondary" }}
						>
							Reply to guest
						</Button>
					)}
				</Box>
			)}
		</Box>
	);
};

export const ReviewItem = memo(ReviewItemComponent);
