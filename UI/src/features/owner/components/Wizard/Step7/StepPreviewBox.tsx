import { Box, Typography, Paper, Divider, Chip } from "@mui/material";
import type { WizardForm, ImageItem, RoomForm } from "../../../types/owner.types";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

interface Props {
	form: WizardForm;
}

const CompactImageGallery = ({ images, height = 80 }: { images: ImageItem[]; height?: number }) => {
	if (images.length === 0) return null;
	return (
		<Box display="flex" gap={1} mt={1.5} sx={{ overflowX: "auto", pb: 0.5, "&::-webkit-scrollbar": { height: 4 }, "&::-webkit-scrollbar-thumb": { bgcolor: "divider", borderRadius: 2 } }}>
			{images.map((img) => (
				<Box
					key={img.id}
					component="img"
					src={img.url || (img.file ? URL.createObjectURL(img.file) : "")}
					sx={{
						width: height * 1.33,
						height: height,
						objectFit: "cover",
						borderRadius: 1.5,
						flexShrink: 0,
						border: "1px solid",
						borderColor: "divider",
					}}
				/>
			))}
		</Box>
	);
};

const StepPreviewBox = ({ form }: Props) => {
	const accommodationImages = form.images.filter((img) => img.target === "accommodation");

	const getRoomImages = (room: RoomForm) => {
		return form.images.filter((img) => img.target === "room" && (img.roomTempId === room.tempId || (img.roomId && img.roomId === room.id)));
	};

	return (
		<Box display="flex" flexDirection="column" gap={3}>
			{/* Header */}
			<Box>
				<Typography variant="h6" fontWeight={700}>
					Review Your Listing
				</Typography>
				<Typography variant="body2" color="text.secondary" mt={0.5}>
					Please review the details below. Once you publish, your accommodation will be live for bookings.
				</Typography>
			</Box>

			<Divider />

			{/* Accommodation Section */}
			<Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
				<Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2} mb={1}>
					<Box>
						<Typography variant="subtitle1" fontWeight={700}>
							{form.name || "Unnamed Property"}
						</Typography>
						<Box display="flex" alignItems="center" gap={0.5} color="text.secondary">
							<LocationOnOutlinedIcon sx={{ fontSize: 16 }} />
							<Typography variant="caption">{form.address.fullAddress || "No address provided"}</Typography>
						</Box>
					</Box>
					<Box display="flex" gap={1}>
						<Chip label={form.rentalType.replace(/_/g, " ")} color="primary" size="small" />
						<Chip label={form.accommodationType} variant="outlined" size="small" />
					</Box>
				</Box>

				<Typography variant="body2" sx={{ whiteSpace: "pre-line", mb: 2, color: "text.secondary", fontSize: "0.875rem" }}>
					{form.description}
				</Typography>

				<Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
					{form.facilities.map((fac) => (
						<Chip key={fac.id} icon={<CheckCircleOutlineIcon sx={{ fontSize: "14px !important" }} />} label={fac.name} size="small" variant="outlined" sx={{ fontSize: "0.75rem" }} />
					))}
				</Box>

				<Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
					Property Images ({accommodationImages.length})
				</Typography>
				<CompactImageGallery images={accommodationImages} height={100} />
			</Paper>

			{/* Rooms Section */}
			<Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
				<Typography variant="subtitle2" fontWeight={700} mb={2} display="flex" alignItems="center" gap={1}>
					<MeetingRoomOutlinedIcon color="primary" fontSize="small" /> Rooms ({form.rooms.length})
				</Typography>

				<Box display="flex" flexDirection="column" gap={2}>
					{form.rooms.map((room, idx) => {
						const roomImages = getRoomImages(room);
						return (
							<Box key={room.tempId || idx}>
								<Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
									<Typography variant="subtitle2" fontWeight={600} fontSize="0.875rem">
										{room.name}
									</Typography>
									<Typography variant="caption" fontWeight={700} color="primary">
										{room.price ? `${Number(room.price).toLocaleString()} / ${room.pricingType.toLowerCase()}` : "Price not set"}
									</Typography>
								</Box>
								<Typography variant="caption" color="text.secondary" display="block" mb={1}>
									{room.maxAdults} Adults · {room.maxChildren} Children · {room.bedroomCount} Bedrooms · {room.size} m²
								</Typography>

								<Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
									{room.amenities.map((am) => (
										<Chip key={am.amenityId} label={am.name} size="small" variant="outlined" sx={{ height: 20, fontSize: "0.7rem" }} />
									))}
								</Box>

								<CompactImageGallery images={roomImages} height={70} />

								{idx < form.rooms.length - 1 && <Divider sx={{ mt: 2 }} />}
							</Box>
						);
					})}
					{form.rooms.length === 0 && (
						<Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
							No rooms added.
						</Typography>
					)}
				</Box>
			</Paper>
		</Box>
	);
};

export default StepPreviewBox;