import { Box, Typography, Paper, Chip, Stack, IconButton, Tooltip } from "@mui/material";
import KingBedOutlinedIcon from "@mui/icons-material/KingBedOutlined";
import WifiOutlinedIcon from "@mui/icons-material/WifiOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import ChildCareOutlinedIcon from "@mui/icons-material/ChildCareOutlined";
import BathtubOutlinedIcon from "@mui/icons-material/BathtubOutlined";
import AspectRatioOutlinedIcon from "@mui/icons-material/AspectRatioOutlined";
import LandscapeOutlinedIcon from "@mui/icons-material/LandscapeOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import type { RoomForm } from "../../../types/owner.types";

interface Props {
	room: RoomForm;
	rentalType?: string;
	onEdit: () => void;
	onDelete: () => void;
}

function SummaryItem({ icon, label }: { icon: React.ReactNode; label: string }) {
	return (
		<Box display="flex" alignItems="center" gap={0.5}>
			<Box sx={{ color: "text.secondary", display: "flex", alignItems: "center", "& svg": { fontSize: 14 } }}>{icon}</Box>
			<Typography variant="caption" color="text.secondary">
				{label}
			</Typography>
		</Box>
	);
}

export default function RoomCard({ room, rentalType, onEdit, onDelete }: Props) {
	const hasAmenities = room.amenities.length > 0;

	return (
		<Paper
			elevation={0}
			sx={{
				p: 2.5,
				borderRadius: 3,
				border: "1.5px solid",
				borderColor: hasAmenities ? "primary.main" : "divider",
				transition: "box-shadow 0.2s, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.3s",
				transform: hasAmenities ? "translateX(12px)" : "translateX(0px)",
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

			{/* Summary block — MUI icon rows */}
			<Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "action.hover" }}>
				<Box display="flex" flexWrap="wrap" gap={1.5}>
					<SummaryItem icon={<PeopleOutlineIcon />} label={`Up to ${room.maxAdults} adults`} />
					<SummaryItem icon={<ChildCareOutlinedIcon />} label={`${room.maxChildren} children`} />
					{rentalType !== "PRIVATE_ROOM" && <SummaryItem icon={<KingBedOutlinedIcon />} label={`${room.bedroomCount} bedroom${room.bedroomCount !== 1 ? "s" : ""}`} />}
					{rentalType !== "PRIVATE_ROOM" && <SummaryItem icon={<BathtubOutlinedIcon />} label={`${room.bathroomCount} bath${room.bathroomCount !== 1 ? "s" : ""}`} />}
					{room.size ? <SummaryItem icon={<AspectRatioOutlinedIcon />} label={`${room.size} m²`} /> : null}
					{room.viewType !== "NONE" ? <SummaryItem icon={<LandscapeOutlinedIcon />} label={`${room.viewType.replace(/_/g, " ")} view`} /> : null}
					{room.price ? <SummaryItem icon={<SellOutlinedIcon />} label={`${room.price.toLocaleString("vi-VN")} VND / ${room.pricingType.replace(/_/g, " ").toLowerCase()}`} /> : null}
				</Box>
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
