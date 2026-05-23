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
import type { ReactNode } from "react";
import { formatVND } from "../../../../../utils/moneyConverter";

type Props = Readonly<{
	room: RoomForm;
	onEdit: () => void;
	onDelete: () => void;
}>;

function SummaryItem({ icon, label }: Readonly<{ icon: ReactNode; label: string }>) {
	return (
		<Box display="flex" alignItems="center" gap={0.75}>
			<Box sx={{ color: "text.secondary", display: "flex", alignItems: "center", "& svg": { fontSize: 16 } }}>{icon}</Box>
			<Typography variant="caption" color="text.secondary" fontWeight={500}>
				{label}
			</Typography>
		</Box>
	);
}

export default function RoomCard({ room, onEdit, onDelete }: Props) {
	return (
		<Paper
			elevation={0}
			sx={{
				p: 2.5,
				borderRadius: "16px",
				border: "1px solid",
				borderColor: "rgba(255,255,255,0.08)",
				bgcolor: "rgba(255,255,255,0.02)",
				transition: "all 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
				"&:hover": {
					borderColor: "primary.main",
					bgcolor: "rgba(255,255,255,0.04)",
					boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
				},
			}}
		>
			{/* Header row */}
			<Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
				<Box display="flex" alignItems="center" gap={1.5}>
					<Box sx={{ width: 32, height: 32, borderRadius: "8px", bgcolor: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
						<KingBedOutlinedIcon fontSize="small" color="primary" />
					</Box>
					<Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: "1.05rem" }}>
						{room.name || "Unnamed Room"}
					</Typography>
					{room.quantity > 1 && <Chip label={`×${room.quantity}`} size="small" color="primary" sx={{ height: 22, fontSize: "0.7rem", fontWeight: 700, borderRadius: 1.5 }} />}
				</Box>

				<Box display="flex" gap={1}>
					<Tooltip title="Edit room">
						<IconButton
							size="small"
							onClick={onEdit}
							sx={{ border: "1px solid", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px", "&:hover": { borderColor: "primary.main", color: "primary.main" } }}
						>
							<EditOutlinedIcon fontSize="small" />
						</IconButton>
					</Tooltip>
					<Tooltip title="Delete room">
						<IconButton
							size="small"
							onClick={onDelete}
							color="error"
							sx={{ border: "1px solid", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px", "&:hover": { borderColor: "error.main", bgcolor: "rgba(239, 68, 68, 0.1)" } }}
						>
							<DeleteOutlineIcon fontSize="small" />
						</IconButton>
					</Tooltip>
				</Box>
			</Box>

			{/* Summary block */}
			<Box sx={{ p: 2, borderRadius: "10px", bgcolor: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.03)" }}>
				<Box display="flex" flexWrap="wrap" gap={2.5}>
					<SummaryItem icon={<PeopleOutlineIcon />} label={`Up to ${room.maxAdults} adults`} />
					<SummaryItem icon={<ChildCareOutlinedIcon />} label={`${room.maxChildren} children`} />
					<SummaryItem icon={<KingBedOutlinedIcon />} label={`${room.bedroomCount} bedroom${room.bedroomCount === 1 ? "" : "s"}`} />
					<SummaryItem icon={<BathtubOutlinedIcon />} label={`${room.bathroomCount} bath${room.bathroomCount === 1 ? "" : "s"}`} />
					{room.size && <SummaryItem icon={<AspectRatioOutlinedIcon />} label={`${room.size} m²`} />}
					{room.viewType !== "NONE" && <SummaryItem icon={<LandscapeOutlinedIcon />} label={`${room.viewType.replaceAll("_", " ")} view`} />}
					{room.price && <SummaryItem icon={<SellOutlinedIcon />} label={`${formatVND(room.price)} / ${room.pricingType.replaceAll("_", " ").toLowerCase()}`} />}
				</Box>
			</Box>

			{/* Beds & Amenities chips */}
			<Stack direction="row" spacing={1} mt={2} flexWrap="wrap" useFlexGap>
				{room.beds.length > 0 &&
					room.beds.map((b) => (
						<Chip
							key={b.id}
							icon={<KingBedOutlinedIcon style={{ fontSize: 14 }} />}
							label={b.name || b.bedType}
							size="small"
							sx={{ bgcolor: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px" }}
						/>
					))}

				{room.beds.length > 0 && room.amenities.length > 0 && <Box sx={{ width: "1px", bgcolor: "rgba(255,255,255,0.1)", mx: 1 }} />}

				{room.amenities.length > 0 &&
					room.amenities
						.slice(0, 4)
						.map((a) => (
							<Chip
								key={a.id}
								icon={<WifiOutlinedIcon style={{ fontSize: 14 }} />}
								label={a.name}
								size="small"
								sx={{ bgcolor: "transparent", color: "text.secondary", "& .MuiChip-icon": { color: "text.disabled" } }}
							/>
						))}
				{room.amenities.length > 4 && <Chip label={`+${room.amenities.length - 4} more`} size="small" sx={{ bgcolor: "transparent", color: "text.disabled" }} />}
			</Stack>
		</Paper>
	);
}
