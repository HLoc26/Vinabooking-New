import { Box, Typography, Grid, Paper, Divider, Chip, CircularProgress, Alert } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HomeIcon from "@mui/icons-material/Home";
import WifiIcon from "@mui/icons-material/Wifi";
import PoolIcon from "@mui/icons-material/Pool";
import LocalParkingIcon from "@mui/icons-material/LocalParking";

import { useOwnerFacilities } from "../../../hooks/useOwnerFacility";
import type { WizardForm, FacilityDto } from "../../../types/owner.types";

// ─── Icon mapper ──────────────────────────────────────────────────────────────

const getFacilityIcon = (name: string) => {
	const key = name.toLowerCase();
	if (key.includes("wifi")) return WifiIcon;
	if (key.includes("pool")) return PoolIcon;
	if (key.includes("parking")) return LocalParkingIcon;
	return HomeIcon;
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
	form: WizardForm;
	setForm: React.Dispatch<React.SetStateAction<WizardForm>>;
	// Called after a new facility is added so the page can auto-expand it in the panel
	onSelect: (id: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StepFacilityBox({ form, setForm, onSelect }: Props) {
	const { groupedByType, isLoading, isError } = useOwnerFacilities();

	const selectedIds = new Set(form.facilities.map((f) => f.id));

	const handleTileClick = (dto: FacilityDto) => {
		if (selectedIds.has(dto.id)) {
			// Already selected — tell the page to expand/focus it in the panel
			onSelect(dto.id);
			return;
		}

		// Add with defaults
		const newEntry: FacilityConfig = {
			id: dto.id,
			name: dto.name,
			accommodationId: "",
			facilityId: dto.id,
			fee: 0,
			note: undefined,
		};

		setForm((prev) => ({ ...prev, facilities: [...prev.facilities, newEntry] }));
		// Tell the page to auto-expand this new row in the panel
		onSelect(dto.id);
	};

	// ── Loading / error ───────────────────────────────────────────────────────

	if (isLoading) {
		return (
			<Box display="flex" justifyContent="center" py={6}>
				<CircularProgress />
			</Box>
		);
	}

	if (isError) {
		return (
			<Alert severity="error" sx={{ borderRadius: 2 }}>
				Failed to load facilities. Please refresh and try again.
			</Alert>
		);
	}

	// ── Render ────────────────────────────────────────────────────────────────

	return (
		<Box>
			{/* Header */}
			<Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
				<Box>
					<Typography variant="h5" fontWeight={800} mb={1} sx={{ color: "#c4b921" }}>
						Select Facilities & Amenities
					</Typography>
					<Typography variant="body2" color="text.secondary" mb={4}>
						Click the tiles to add them to your property. Configure fees and notes in the panel on the right.
					</Typography>
				</Box>
				{form.facilities.length > 0 && <Chip label={`${form.facilities.length} selected`} color="primary" size="small" sx={{ ml: 2, mt: 0.5, flexShrink: 0 }} />}
			</Box>

			{/* Grouped tiles */}
			{Object.entries(groupedByType).map(([type, items]) => (
				<Box key={type} mb={5}>
					<Typography
						variant="subtitle2"
						sx={{
							fontWeight: 800,
							color: "#ffffff",
							letterSpacing: 1.5,
							textTransform: "uppercase",
							mb: 1,
						}}
					>
						{type.replace(/_/g, " ")}
					</Typography>

					<Divider sx={{ mb: 3, borderColor: "#3f51b5", opacity: 0.2 }} />

					<Grid container spacing={2}>
						{items.map((facility) => {
							const isSelected = selectedIds.has(facility.id);
							const Icon = getFacilityIcon(facility.name);
							const entry = form.facilities.find((f) => f.id === facility.id);
							const hasMeta = !!entry && ((entry.fee ?? 0) > 0 || !!entry.note);

							return (
								<Grid size={{ xs: 6, sm: 4, md: 3 }} key={facility.id}>
									<Paper
										onClick={() => handleTileClick(facility)}
										elevation={0}
										sx={{
											p: 3,
											height: 120,
											display: "flex",
											flexDirection: "column",
											justifyContent: "center",
											alignItems: "center",
											cursor: "pointer",
											borderRadius: 3,
											position: "relative",
											transition: "all 0.3s",
											border: "2px solid",
											borderColor: isSelected ? "#1a1a1a" : "#eeeeee",
											bgcolor: isSelected ? "#1a1a1a" : "#fdfdfd",
											color: isSelected ? "#ffffff" : "#424242",
											"&:hover": {
												transform: "translateY(-6px)",
												boxShadow: isSelected ? "0 10px 20px rgba(0,0,0,0.3)" : "0 10px 20px rgba(0,0,0,0.05)",
												borderColor: "#1a1a1a",
												bgcolor: isSelected ? "#333333" : "#ffffff",
											},
										}}
									>
										{isSelected && (
											<CheckCircleIcon
												sx={{
													position: "absolute",
													top: 10,
													right: 10,
													fontSize: 18,
													color: "#ffffff",
												}}
											/>
										)}

										{hasMeta && (
											<Box
												sx={{
													position: "absolute",
													top: 10,
													left: 10,
													width: 8,
													height: 8,
													borderRadius: "50%",
													bgcolor: "warning.main",
												}}
											/>
										)}

										<Icon
											sx={{
												fontSize: 38,
												mb: 1.5,
												color: isSelected ? "#ffffff" : "#757575",
											}}
										/>

										<Typography
											variant="body2"
											sx={{
												fontWeight: isSelected ? 800 : 600,
												textAlign: "center",
												fontSize: "0.85rem",
												display: "-webkit-box",
												WebkitLineClamp: 2,
												WebkitBoxOrient: "vertical",
												overflow: "hidden",
											}}
										>
											{facility.name}
										</Typography>

										{entry && (entry.fee ?? 0) > 0 && (
											<Typography variant="caption" sx={{ mt: 0.5, color: "#ffffff99", fontSize: "0.7rem" }}>
												{entry.fee!.toLocaleString()}₫
											</Typography>
										)}
									</Paper>
								</Grid>
							);
						})}
					</Grid>
				</Box>
			))}
		</Box>
	);
}
