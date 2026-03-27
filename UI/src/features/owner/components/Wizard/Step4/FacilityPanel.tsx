import { Box, Typography, Paper, Chip, Collapse, TextField, Button } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import HomeIcon from "@mui/icons-material/Home";
import WifiIcon from "@mui/icons-material/Wifi";
import PoolIcon from "@mui/icons-material/Pool";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import type { WizardForm, FacilityConfig } from "../../../types/owner.types";

// ─── Icon mapper (shared, mirrors StepFacilityBox) ────────────────────────────

const getFacilityIcon = (name: string) => {
	const key = name.toLowerCase();
	if (key.includes("wifi")) return WifiIcon;
	if (key.includes("pool")) return PoolIcon;
	if (key.includes("parking")) return LocalParkingIcon;
	return HomeIcon;
};

// ─── Single facility row ──────────────────────────────────────────────────────

interface FacilityRowProps {
	facility: FacilityConfig;
	isExpanded: boolean;
	onToggle: () => void;
	onUpdate: (patch: Partial<Pick<FacilityConfig, "fee" | "note">>) => void;
	onRemove: () => void;
}

function FacilityRow({ facility, isExpanded, onToggle, onUpdate, onRemove }: FacilityRowProps) {
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
}

// ─── Panel ────────────────────────────────────────────────────────────────────

interface Props {
	form: WizardForm;
	setForm: React.Dispatch<React.SetStateAction<WizardForm>>;
	// expandedId is lifted here so StepFacilityBox can auto-expand on select
	expandedId: string | null;
	setExpandedId: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function FacilityPanel({ form, setForm, expandedId, setExpandedId }: Props) {
	const updateFacility = (id: string, patch: Partial<Pick<FacilityConfig, "fee" | "note">>) => {
		setForm((prev) => ({
			...prev,
			facilities: prev.facilities.map((f) => (f.id === id ? { ...f, ...patch } : f)),
		}));
	};

	const removeFacility = (id: string) => {
		setForm((prev) => ({
			...prev,
			facilities: prev.facilities.filter((f) => f.id !== id),
		}));
		if (expandedId === id) setExpandedId(null);
	};

	return (
		<Paper
			elevation={0}
			sx={{
				width: 280,
				flexShrink: 0,
				borderRadius: 3,
				border: "1px solid",
				borderColor: "divider",
				overflow: "hidden",
				position: "sticky",
				top: 24,
			}}
		>
			{/* Header */}
			<Box
				sx={{
					px: 2,
					py: 1.5,
					borderBottom: "1px solid",
					borderColor: "divider",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<Typography variant="subtitle2" fontWeight={700}>
					Selected Facilities
				</Typography>
				{form.facilities.length > 0 && <Chip label={form.facilities.length} size="small" color="primary" />}
			</Box>

			{/* Empty state */}
			{form.facilities.length === 0 && (
				<Box px={2} py={4} textAlign="center">
					<Typography variant="body2" color="text.disabled">
						No facilities selected yet.
					</Typography>
					<Typography variant="caption" color="text.disabled">
						Pick tiles on the left to add them here.
					</Typography>
				</Box>
			)}

			{/* Rows in selection order */}
			<Box sx={{ display: "flex", flexDirection: "column", gap: 1, p: form.facilities.length > 0 ? 1.5 : 0 }}>
				{form.facilities.map((f) => (
					<FacilityRow
						key={f.id}
						facility={f}
						isExpanded={expandedId === f.id}
						onToggle={() => setExpandedId((prev) => (prev === f.id ? null : f.id))}
						onUpdate={(patch) => updateFacility(f.id, patch)}
						onRemove={() => removeFacility(f.id)}
					/>
				))}
			</Box>
		</Paper>
	);
}
