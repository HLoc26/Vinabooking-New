import { Card, CardMedia, CardContent, Typography, Box, Chip, Rating } from "@mui/material";
import { MeetingRoomOutlined, StarRateRounded } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import type { OwnerAccommodationCard } from "../../types/owner.types";
import { EAccommodationStatus } from "../../../accommodation/types/accommodation.types";
import { formatDate } from "../../../../utils/dateFormatter";
import { ACCOMMODATION_LABELS } from "../../../home/constants/Const";
import { ACCOMMODATION_DEFAULT_IMAGES } from "../../../accommodation/types/const";

interface AccommodationCardProps {
	data: OwnerAccommodationCard;
	viewMode?: "grid" | "list";
}

export const AccommodationCard = ({ data, viewMode = "grid" }: AccommodationCardProps) => {
	const navigate = useNavigate();
	const formattedDate = formatDate(data.updatedAt);
	const isList = viewMode === "list"; // Cờ kiểm tra chế độ

	const imageUrl = data.thumbnail || ACCOMMODATION_DEFAULT_IMAGES[data.type] || ACCOMMODATION_DEFAULT_IMAGES["ALL"];
	const displayType = ACCOMMODATION_LABELS[data.type] || data.type.replaceAll("_", " ");

	return (
		<Card
			onClick={() => navigate(`/owner/accommodations/${data.id}`)}
			sx={{
				backgroundColor: "background.paper",
				cursor: "pointer",
				transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
				border: "1px solid rgba(255,255,255,0.05)",
				height: "100%",
				display: "flex",
				flexDirection: { xs: "column", sm: isList ? "row" : "column" },
				"&:hover": {
					transform: "translateY(-4px)",
					boxShadow: "0 12px 24px -10px rgba(0,0,0,0.5)",
					borderColor: "primary.main",
				},
			}}
		>
			<Box
				sx={{
					position: "relative",
					width: { xs: "100%", sm: isList ? 280 : "100%" }, // Cố định chiều rộng ảnh nếu nằm ngang
					flexShrink: 0,
				}}
			>
				<CardMedia
					component="img"
					image={imageUrl}
					alt={data.name}
					sx={{
						objectFit: "cover",
						height: { xs: 200, sm: isList ? "100%" : 200 }, // Ảnh full viền dọc nếu nằm ngang
						minHeight: isList ? 200 : "auto",
					}}
				/>

				{data.status !== EAccommodationStatus.PUBLISHED && (
					<Chip
						label={data.status}
						color="error"
						size="small"
						sx={{
							position: "absolute",
							top: 12,
							right: 12,
							fontWeight: "bold",
							backdropFilter: "blur(4px)",
						}}
					/>
				)}
			</Box>

			<CardContent sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
				<Typography variant="caption" color="primary.main" sx={{ fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
					{displayType}
				</Typography>

				<Typography variant="h6" component="h2" color="text.primary" sx={{ mt: 0.5, mb: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
					{data.name}
				</Typography>

				<Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
					{data.address || "Address not updated yet"}
				</Typography>

				<Box sx={{ mt: "auto" }}>
					<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 2, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
						<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
							<MeetingRoomOutlined sx={{ fontSize: 18, color: "text.secondary" }} />
							<Typography variant="body2" color="text.secondary">
								{data.roomCount} {data.roomCount === 1 ? "Room" : "Rooms"}
							</Typography>
						</Box>

						<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
							{data.reviewCount > 0 ? (
								<>
									<Rating
										value={data.avgStar || 0}
										readOnly
										size="small"
										precision={0.5}
										icon={<StarRateRounded fontSize="inherit" />}
										emptyIcon={<StarRateRounded fontSize="inherit" style={{ opacity: 0.3 }} />}
									/>
									<Typography variant="body2" color="text.secondary">
										({data.reviewCount})
									</Typography>
								</>
							) : (
								<Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", fontSize: "0.8rem" }}>
									No reviews yet
								</Typography>
							)}
						</Box>
					</Box>

					<Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 2, opacity: 0.6 }}>
						Last updated: {formattedDate}
					</Typography>
				</Box>
			</CardContent>
		</Card>
	);
};
