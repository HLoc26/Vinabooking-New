import { Box, Typography, Paper, Chip, Stack, IconButton, Tooltip } from "@mui/material";
import KingBedOutlinedIcon from "@mui/icons-material/KingBedOutlined";
import WifiOutlinedIcon from "@mui/icons-material/WifiOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { RoomForm } from "../../../types/owner.types";

interface Props {
	room: RoomForm;
	onEdit: () => void;
	onDelete: () => void;
}

export default function RoomCard({ room, onEdit, onDelete }: Props) {
	return (
		<Paper
			elevation={0}
			sx={{
				p: 2.5,
				borderRadius: 3,
				border: "1.5px solid",
				borderColor: "divider",
				transition: "box-shadow 0.2s",
				"&:hover": { boxShadow: 3 },
			}}
		>
			{/* Header row */}
			<Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
				<Box display="flex" alignItems="center" gap={1}>
					<KingBedOutlinedIcon fontSize="small" color="primary" />
					<Typography variant="subtitle1" fontWeight={700}>
						{room.name || "Unnamed Room"}
					</Typography>
					{room.quantity > 1 && <Chip label={`×${room.quantity}`} size="small" color="primary" variant="outlined" />}
				</Box>

				<Box display="flex" gap={0.5}>
					<Tooltip title="Edit room">
						<IconButton size="small" onClick={onEdit} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
							<EditOutlinedIcon fontSize="small" />
						</IconButton>
					</Tooltip>
					<Tooltip title="Delete room">
						<IconButton size="small" onClick={onDelete} color="error" sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
							<DeleteOutlineIcon fontSize="small" />
						</IconButton>
					</Tooltip>
				</Box>
			</Box>

			{/* Summary block */}
			<Box
				sx={{
					p: 1.5,
					borderRadius: 2,
					bgcolor: "action.hover",
					lineHeight: 1.8,
				}}
			>
				<Typography variant="caption" display="block">
					👥 Up to {room.maxAdults} adults, {room.maxChildren} children &nbsp;·&nbsp; 🛏 {room.bedroomCount} bedroom{room.bedroomCount !== 1 ? "s" : ""} &nbsp;·&nbsp; 🚿 {room.bathroomCount}{" "}
					bath{room.bathroomCount !== 1 ? "s" : ""}
					{room.size ? ` · 📐 ${room.size}m²` : ""}
					{room.viewType !== "NONE" ? ` · 🌅 ${room.viewType.replace(/_/g, " ")} view` : ""}
				</Typography>
				{room.price && (
					<Typography variant="caption" display="block">
						💰 {room.price} / {room.pricingType.replace(/_/g, " ").toLowerCase()}
					</Typography>
				)}
			</Box>

			{/* Beds & Amenities chips */}
			<Stack direction="row" spacing={1} mt={1.5} flexWrap="wrap" useFlexGap>
				{room.beds.map((b) => (
					<Chip key={b.id} icon={<KingBedOutlinedIcon />} label={b.name || b.bedType} size="small" variant="outlined" />
				))}
				{room.amenities.slice(0, 4).map((a) => (
					<Chip key={a.amenityId} icon={<WifiOutlinedIcon />} label={a.name} size="small" />
				))}
				{room.amenities.length > 4 && <Chip label={`+${room.amenities.length - 4} more`} size="small" variant="outlined" />}
			</Stack>
		</Paper>
	);
}
