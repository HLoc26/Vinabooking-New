import { Box, Typography, TextField, Button, Collapse } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import HomeIcon from "@mui/icons-material/Home";
import WifiIcon from "@mui/icons-material/Wifi";
import PoolIcon from "@mui/icons-material/Pool";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import type { FacilityConfig } from "../../../types/owner.types";

const getFacilityIcon = (name: string) => {
	const key = name.toLowerCase();
	if (key.includes("wifi")) return WifiIcon;
	if (key.includes("pool")) return PoolIcon;
	if (key.includes("parking")) return LocalParkingIcon;
	return HomeIcon;
};

interface FacilityRowProps {
	facility: FacilityConfig;
	isExpanded: boolean;
	onToggle: () => void;
	onUpdate: (patch: Partial<Pick<FacilityConfig, "fee" | "note">>) => void;
	onRemove: () => void;
}

export const FacilityDetailRow: React.FC<FacilityRowProps> = ({ facility, isExpanded, onToggle, onUpdate, onRemove }) => {
	const hasMeta = (facility.fee ?? 0) > 0 || !!facility.note;
	const Icon = getFacilityIcon(facility.name);

	return (
		<Box
			sx={{
				borderRadius: 2,
				border: "1.5px solid",
				borderColor: isExpanded ? "primary.main" : "divider",
				overflow: "hidden",
				transition: "border-color 0.2s ease",
			}}
		>
			{/* Row header */}
			<Box
				onClick={onToggle}
				sx={{
					display: "flex",
					alignItems: "center",
					gap: 1.5,
					px: 2,
					py: 1.25,
					cursor: "pointer",
					bgcolor: isExpanded ? "primary.50" : "background.paper",
					transition: "background-color 0.2s ease",
					"&:hover": { bgcolor: isExpanded ? "primary.50" : "action.hover" },
				}}
			>
				<Icon
					sx={{
						fontSize: 20,
						flexShrink: 0,
						color: isExpanded ? "primary.main" : "text.secondary",
						transition: "color 0.2s ease",
					}}
				/>

				<Box flex={1} minWidth={0}>
					<Typography variant="body2" fontWeight={isExpanded ? 700 : 600} noWrap color={isExpanded ? "primary.main" : "text.primary"} sx={{ transition: "color 0.2s ease" }}>
						{facility.name}
					</Typography>
					{hasMeta && !isExpanded && (
						<Box display="flex" gap={0.75} mt={0.25} flexWrap="wrap">
							{(facility.fee ?? 0) > 0 && (
								<Typography variant="caption" color="text.secondary">
									💰 {facility.fee!.toLocaleString()}₫
								</Typography>
							)}
							{facility.note && (
								<Typography
									variant="caption"
									color="text.secondary"
									sx={{
										maxWidth: 120,
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
										display: "block",
									}}
								>
									📝 {facility.note}
								</Typography>
							)}
						</Box>
					)}
				</Box>

				{hasMeta && (
					<Box
						sx={{
							width: 7,
							height: 7,
							borderRadius: "50%",
							bgcolor: "warning.main",
							flexShrink: 0,
						}}
					/>
				)}

				<ExpandMoreIcon
					sx={{
						fontSize: 18,
						color: "text.disabled",
						flexShrink: 0,
						transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
						transition: "transform 0.25s ease",
					}}
				/>
			</Box>

			{/* Slide-down: fee + note */}
			<Collapse in={isExpanded} timeout={250}>
				<Box sx={{ px: 2, pt: 1.5, pb: 2, display: "flex", flexDirection: "column", gap: 1.5 }} onClick={(e) => e.stopPropagation()}>
					<TextField
						fullWidth
						size="small"
						type="number"
						label="Fee (VND)"
						placeholder="0 = free"
						value={facility.fee ?? 0}
						onChange={(e) => onUpdate({ fee: Math.max(0, Number(e.target.value)) })}
						inputProps={{ min: 0, step: 1000 }}
					/>

					<TextField
						fullWidth
						size="small"
						multiline
						rows={2}
						label="Note"
						placeholder="e.g. Available 6am–10pm, towels provided"
						value={facility.note ?? ""}
						onChange={(e) => onUpdate({ note: e.target.value })}
					/>

					<Button size="small" color="error" variant="outlined" startIcon={<DeleteOutlineIcon />} onClick={onRemove} sx={{ borderRadius: 2, alignSelf: "flex-start" }}>
						Remove
					</Button>
				</Box>
			</Collapse>
		</Box>
	);
};
