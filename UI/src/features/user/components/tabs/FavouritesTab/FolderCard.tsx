import { Folder, Delete } from "@mui/icons-material";
import { Badge, Box, IconButton, Paper, Typography } from "@mui/material";
import { formatDate } from "../../../../../utils/dateFormatter";
import type { FavouriteList } from "../../../types/FavouriteList";

type FolderCardProps = {
	favourite: FavouriteList;
	onClick: () => void;
	onDelete?: (id: string) => void;
};

const FolderCard: React.FC<FolderCardProps> = ({ favourite, onClick, onDelete }) => {
	return (
		<Paper
			onClick={onClick}
			sx={{
				p: 2,
				borderRadius: 3,
				cursor: "pointer",
				textAlign: "center",
				height: 160,
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				transition: "0.2s",
				position: "relative",
				"&:hover": { bgcolor: "primary.light", opacity: 0.9 },
			}}
		>
			{/* Delete button */}
			{onDelete && (
				<IconButton
					size="small"
					onClick={(e) => {
						e.stopPropagation(); // stop Card's onClick
						onDelete(favourite.id);
					}}
					sx={{
						position: "absolute",
						top: 4,
						right: 4,
						backgroundColor: "rgba(255,255,255,0.9)",
						"&:hover": {
							backgroundColor: "error.main",
							color: "white",
						},
						pointerEvents: "auto",
					}}
				>
					<Delete fontSize="small" />
				</IconButton>
			)}

			<Box sx={{ display: "inline-block", mb: 1 }}>
				<Badge badgeContent={favourite.items.length} color="error" overlap="circular" sx={{ "& .MuiBadge-badge": { fontSize: 12, fontWeight: "bold" } }}>
					<Folder sx={{ fontSize: 50, color: "#facc15" }} />
				</Badge>
			</Box>

			<Typography variant="subtitle2" fontWeight={600} noWrap sx={{ px: 1 }}>
				{favourite.name}
			</Typography>

			<Typography variant="caption" color="text.secondary">
				{formatDate(favourite.updatedAt.toString())}
			</Typography>
		</Paper>
	);
};

export default FolderCard;
