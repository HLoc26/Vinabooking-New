import { Folder } from "@mui/icons-material";
import { Badge, Box, Paper, Typography } from "@mui/material";
import { formatDate } from "../../../../../utils/dateFormatter";

const FolderCard = ({ favourite, onClick }) => {
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
				"&:hover": { bgcolor: "primary.light", opacity: 0.9 },
			}}
		>
			<Box sx={{ position: "relative", display: "inline-block", mb: 1 }}>
				<Badge badgeContent={favourite.items.length} color="error" overlap="circular" sx={{ "& .MuiBadge-badge": { fontSize: 12, fontWeight: "bold" } }}>
					<Folder sx={{ fontSize: 50, color: "#facc15" }} />
				</Badge>
			</Box>

			<Typography variant="subtitle2" fontWeight={600} noWrap sx={{ px: 1 }}>
				{favourite.name}
			</Typography>

			<Typography variant="caption" color="text.secondary">
				{formatDate(favourite.updatedAt)}
			</Typography>
		</Paper>
	);
};

export default FolderCard;
