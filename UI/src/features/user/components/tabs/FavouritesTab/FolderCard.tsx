import { useState } from "react";
import { Folder, Delete } from "@mui/icons-material";
import { Badge, Box, IconButton, Paper, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { formatDate } from "../../../../../utils/dateFormatter";

type FolderCardProps = {
	favourite: {
		id: string;
		name: string;
		items: { id: string; accommodationId: string }[];
		updatedAt: string | Date;
	};
	onClick: () => void;
	onDelete?: (id: string) => void;
};

const FolderCard: React.FC<FolderCardProps> = ({ favourite, onClick, onDelete }) => {
	const [confirmOpen, setConfirmOpen] = useState(false);

	const handleDeleteClick = (e: React.MouseEvent) => {
		e.stopPropagation(); // stop card's onClick
		if (favourite.items.length > 0) {
			// only show confirm modal if list have items
			setConfirmOpen(true);
		} else {
			onDelete?.(favourite.id);
		}
	};

	const handleConfirm = () => {
		onDelete?.(favourite.id);
		setConfirmOpen(false);
	};

	return (
		<>
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
				{/* Icon Delete góc trên */}
				{onDelete && (
					<IconButton
						size="small"
						onClick={handleDeleteClick}
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
							transition: "0.2s",
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

			{/* Modal confirm xóa */}
			<Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
				<DialogTitle>Delete Favourite List</DialogTitle>
				<DialogContent>
					<Typography>
						This list has {favourite.items.length} item{favourite.items.length > 1 ? "s" : ""}. Are you sure you want to delete it? This action cannot be undone.
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
					<Button variant="contained" color="error" onClick={handleConfirm}>
						Delete
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default FolderCard;
