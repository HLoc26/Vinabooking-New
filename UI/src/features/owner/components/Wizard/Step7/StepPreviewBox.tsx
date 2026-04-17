import { Box, Typography, Paper, Grid, Divider, Chip } from "@mui/material";
import type { WizardForm } from "../../../types/owner.types";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";

interface Props {
	form: WizardForm;
}

const StepPreviewBox = ({ form }: Props) => {
	const coverImage = form.images.find((img) => img.target === "accommodation");

	return (
		<Box>
			<Typography variant="h5" fontWeight={800} mb={1} color="primary">
				Review Your Listing
			</Typography>
			<Typography variant="body2" color="text.secondary" mb={4}>
				Please review the details below. Once you publish, your accommodation will be live for bookings.
			</Typography>

			<Grid container spacing={4}>
				{/* Left Column: Basic Info & Facilities */}
				<Grid item xs={12} md={7}>
					<Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
						<Typography variant="h6" fontWeight={700} mb={2}>
							{form.name || "Unnamed Property"}
						</Typography>
						<Box display="flex" alignItems="center" gap={1} mb={2} color="text.secondary">
							<LocationOnOutlinedIcon fontSize="small" />
							<Typography variant="body2">{form.address.fullAddress || "No address provided"}</Typography>
						</Box>

						<Box display="flex" gap={1} mb={3}>
							<Chip label={form.rentalType.replace(/_/g, " ")} color="primary" size="small" />
							<Chip label={form.accommodationType} variant="outlined" size="small" />
						</Box>

						<Typography variant="body2" sx={{ whiteSpace: "pre-line", mb: 3 }}>
							{form.description}
						</Typography>

						<Divider sx={{ my: 2 }} />

						<Typography variant="subtitle1" fontWeight={700} mb={1.5}>
							Facilities
						</Typography>
						<Box display="flex" flexWrap="wrap" gap={1}>
							{form.facilities.map((fac) => (
								<Chip key={fac.id} icon={<CheckCircleOutlineIcon />} label={fac.name} size="small" variant="outlined" />
							))}
							{form.facilities.length === 0 && (
								<Typography variant="body2" color="text.secondary">
									No facilities added.
								</Typography>
							)}
						</Box>
					</Paper>

					{/* Rooms Summary */}
					<Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
						<Typography variant="subtitle1" fontWeight={700} mb={2} display="flex" alignItems="center" gap={1}>
							<MeetingRoomOutlinedIcon color="primary" /> Rooms ({form.rooms.length})
						</Typography>

						{form.rooms.map((room, idx) => (
							<Box key={room.tempId || idx} mb={idx < form.rooms.length - 1 ? 2 : 0}>
								<Typography variant="subtitle2" fontWeight={600}>
									{room.name}
								</Typography>
								<Typography variant="caption" color="text.secondary" display="block">
									{room.maxAdults} Adults · {room.maxChildren} Children · {room.bedroomCount} Bedrooms
								</Typography>
								{idx < form.rooms.length - 1 && <Divider sx={{ mt: 2 }} />}
							</Box>
						))}
					</Paper>
				</Grid>

				{/* Right Column: Images */}
				<Grid item xs={12} md={5}>
					<Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid", borderColor: "divider", height: "100%" }}>
						<Typography variant="subtitle1" fontWeight={700} mb={2}>
							Images ({form.images.length})
						</Typography>

						{coverImage ? (
							<Box sx={{ width: "100%", height: 200, borderRadius: 2, overflow: "hidden", mb: 2 }}>
								<img
									src={coverImage.url || (coverImage.file ? URL.createObjectURL(coverImage.file) : "")}
									alt="Cover"
									style={{ width: "100%", height: "100%", objectFit: "cover" }}
								/>
							</Box>
						) : (
							<Box sx={{ width: "100%", height: 200, borderRadius: 2, bgcolor: "action.hover", display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
								<Typography variant="body2" color="text.secondary">
									No cover image
								</Typography>
							</Box>
						)}

						<ImageList sx={{ width: "100%", height: 300 }} cols={3} rowHeight={100}>
							{form.images.filter((img) => img !== coverImage).map((item) => (
								<ImageListItem key={item.id}>
									<img
										src={item.url || (item.file ? URL.createObjectURL(item.file) : "")}
										alt="Property preview"
										loading="lazy"
										style={{ borderRadius: 8, height: "100%", objectFit: "cover" }}
									/>
								</ImageListItem>
							))}
						</ImageList>
					</Paper>
				</Grid>
			</Grid>
		</Box>
	);
};

export default StepPreviewBox;