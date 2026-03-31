import { Box, Typography, Paper } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import type { FacilityDto } from "../../../types/owner.types";
import type { FacilityConfig } from "../../../../accommodation/types/accommodation.types";
import type React from "react";
import { EDIT_BG, EDIT_BORDER, getFacilityIcon } from "../../../const/FacilityConst";

interface FacilityCardProps {
	facility: FacilityDto;
	entry?: FacilityConfig;
	isSelected: boolean;
	isEditing: boolean;
	onSelect: () => void;
	onDeselect: () => void;
	onEdit: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const FacilityCard: React.FC<FacilityCardProps> = ({ facility, entry, isSelected, isEditing, onSelect, onDeselect, onEdit }) => {
	const Icon = getFacilityIcon(facility.name);
	const hasMeta = !!entry && ((entry.fee ?? 0) > 0 || !!entry.note);

	return (
		<Paper
			elevation={0}
			sx={{
				height: 120,
				width: 200,
				cursor: isSelected ? "default" : "pointer",
				position: "relative",
				overflow: "hidden",
				transition: `transform 0.75s cubic-bezier(0.23, 1, 0.32, 1), 
							background-color 0.75s cubic-bezier(0.23, 1, 0.32, 1),
							border-color 0.75s cubic-bezier(0.23, 1, 0.32, 1),
							box-shadow 0.25s cubic-bezier(0.23, 1, 0.32, 1),
							border-radius 0.25s cubic-bezier(0.23, 1, 0.32, 1)`,
				border: "2px solid",
				mb: "20px",
				borderColor: isEditing ? EDIT_BORDER : isSelected ? "primary.main" : "divider",
				bgcolor: isEditing ? EDIT_BG : isSelected ? "primary.50" : "background.paper",
				borderRadius: 3,
				...(isEditing && {
					borderBottomLeftRadius: 0,
					borderBottomRightRadius: 0,
					borderBottom: 0,
					height: 130,
					mb: "8px",
					zIndex: 10,
				}),
				"&:hover": !isSelected ? { transform: "translateY(-4px)", borderColor: "primary.light", boxShadow: 3 } : {},
				...(isSelected &&
					!isEditing && {
						"&:hover .content-wrapper": { transform: "translateY(-14px) scale(0.85)" },
						"&:hover .action-bar": { transform: "translateY(0)", opacity: 1 },
					}),
			}}
			onClick={!isSelected ? onSelect : undefined}
		>
			<Box
				className="content-wrapper"
				sx={{
					position: "relative",
					width: "100%",
					height: "116px",
					p: 2,
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					alignItems: "center",
					transition: "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
					transformOrigin: "top center",
				}}
			>
				{hasMeta && <Box sx={{ position: "absolute", bottom: 8, left: 10, width: 7, height: 7, borderRadius: "50%", bgcolor: "warning.main" }} />}
				<Icon sx={{ fontSize: 34, mb: 1, color: isEditing ? EDIT_BORDER : isSelected ? "primary.main" : "text.secondary", transition: "color 0.2s" }} />
				<Typography
					variant="body2"
					sx={{
						fontWeight: isSelected ? 800 : 600,
						textAlign: "center",
						fontSize: "0.82rem",
						display: "-webkit-box",
						WebkitLineClamp: 2,
						WebkitBoxOrient: "vertical",
						overflow: "hidden",
						color: isEditing ? EDIT_BORDER : isSelected ? "primary.main" : "text.primary",
						transition: "color 0.2s",
					}}
				>
					{facility.name}
				</Typography>
				{entry && (entry.fee ?? 0) > 0 && !isEditing && (
					<Typography variant="caption" sx={{ mt: 0.5, color: "warning.main", fontSize: "0.68rem", fontWeight: 700 }}>
						{entry.fee!.toLocaleString()}₫
					</Typography>
				)}
			</Box>

			{isSelected && !isEditing && entry && (
				<Box
					className="action-bar"
					sx={{
						position: "absolute",
						bottom: 0,
						left: 0,
						right: 0,
						height: "36px",
						display: "flex",
						transform: "translateY(100%)",
						opacity: 0,
						transition: "all 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
					}}
				>
					<Box
						onClick={(e) => {
							e.stopPropagation();
							onDeselect();
						}}
						sx={{
							flex: 1,
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							gap: 0.5,
							bgcolor: "rgba(239, 68, 68, 0.1)",
							color: "error.main",
							cursor: "pointer",
							borderTop: "1px solid rgba(239, 68, 68, 0.2)",
							borderRight: "1px solid rgba(255, 255, 255, 0.05)",
							"&:hover": { bgcolor: "error.main", color: "white" },
							transition: "all 0.2s ease",
						}}
					>
						<CloseIcon sx={{ fontSize: 16 }} />
						<Typography variant="caption" fontWeight="bold">
							Remove
						</Typography>
					</Box>
					<Box
						onClick={(e) => {
							e.stopPropagation();
							onEdit(e);
						}}
						sx={{
							flex: 1,
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							gap: 0.5,
							bgcolor: "rgba(245, 166, 35, 0.1)",
							color: "primary.main",
							cursor: "pointer",
							borderTop: "1px solid rgba(245, 166, 35, 0.2)",
							"&:hover": { bgcolor: "primary.main", color: "#121212" },
							transition: "all 0.2s ease",
						}}
					>
						<EditOutlinedIcon sx={{ fontSize: 16 }} />
						<Typography variant="caption" fontWeight="bold">
							Edit
						</Typography>
					</Box>
				</Box>
			)}
		</Paper>
	);
};

export default FacilityCard;
