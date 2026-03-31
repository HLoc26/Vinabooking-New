import { Box, Typography, Grid, Divider, Chip, CircularProgress, Alert } from "@mui/material";
import { useOwnerFacilities } from "../../../hooks/useOwnerFacility";
import type { WizardForm, FacilityDto } from "../../../types/owner.types";
import { EFacilityType, type FacilityConfig } from "../../../../accommodation/types/accommodation.types";
import { useState } from "react";
import type React from "react";

// Sub-components
import FacilityCard from "./FacilityCard";
import FacilityEditPopout from "./FacilityEditPopout";

interface StepFacilityBoxProps {
	form: WizardForm;
	setForm: React.Dispatch<React.SetStateAction<WizardForm>>;
}

const StepFacilityBox: React.FC<StepFacilityBoxProps> = ({ form, setForm }) => {
	const { groupedByType, isLoading, isError } = useOwnerFacilities();

	// Inline editing state management
	const [editFacilityId, setEditFacilityId] = useState<string | null>(null);
	const [editFee, setEditFee] = useState<number>(0);
	const [editNote, setEditNote] = useState<string>("");

	const selectedIds = new Set(form.facilities.map((f) => f.id));

	const openEditInline = (facility: FacilityConfig) => {
		setEditFacilityId(facility.id);
		setEditFee(facility.fee ?? 0);
		setEditNote(facility.note ?? "");
	};

	const closeEditInline = () => setEditFacilityId(null);

	const handleSelect = (dto: FacilityDto) => {
		if (selectedIds.has(dto.id)) return;
		const newEntry: FacilityConfig = { id: dto.id, name: dto.name, fee: 0, note: "", type: EFacilityType.GENERAL, description: "" };
		setForm((prev) => ({ ...prev, facilities: [...prev.facilities, newEntry] }));
	};

	const handleDeselect = (id: string) => {
		setForm((prev) => ({ ...prev, facilities: prev.facilities.filter((f) => f.id !== id) }));
		if (editFacilityId === id) closeEditInline();
	};

	const handleSaveInline = () => {
		if (editFacilityId) {
			setForm((prev) => ({
				...prev,
				facilities: prev.facilities.map((f) => (f.id === editFacilityId ? { ...f, fee: editFee, note: editNote } : f)),
			}));
		}
		closeEditInline();
	};

	if (isLoading)
		return (
			<Box display="flex" justifyContent="center" py={6}>
				<CircularProgress />
			</Box>
		);
	if (isError)
		return (
			<Alert severity="error" sx={{ borderRadius: 2 }}>
				Failed to load facilities.
			</Alert>
		);

	return (
		<Box>
			<Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
				<Box>
					<Typography variant="h5" fontWeight={800} mb={1} color="primary">
						Select Facilities & Amenities
					</Typography>
					<Typography variant="body2" color="text.secondary" mb={4}>
						Click a tile to select it. Hover selected items to configure fees and notes.
					</Typography>
				</Box>
				{form.facilities.length > 0 && <Chip label={`${form.facilities.length} selected`} color="primary" size="small" sx={{ ml: 2, mt: 0.5, flexShrink: 0 }} />}
			</Box>

			{Object.entries(groupedByType).map(([type, items]) => (
				<Box key={type} mb={5}>
					<Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", mb: 1 }}>
						{type.replace(/_/g, " ")}
					</Typography>
					<Divider sx={{ mb: 3, opacity: 0.2 }} />

					<Grid
						container
						spacing={2}
						sx={{
							// Megamenu positioning logic
							"@media (max-width: 599px)": {
								"& > div:nth-of-type(2n+1) .facility-popout": { left: 0, width: "calc(200% + 16px)", borderTopLeftRadius: 0, borderTopRightRadius: 12 },
								"& > div:nth-of-type(2n) .facility-popout": { left: "calc(-100% - 16px)", width: "calc(200% + 16px)", borderTopLeftRadius: 12, borderTopRightRadius: 0 },
							},
							"@media (min-width: 600px) and (max-width: 899px)": {
								"& > div:nth-of-type(3n+1) .facility-popout": { left: 0, width: "calc(300% + 32px)", borderTopLeftRadius: 0, borderTopRightRadius: 12 },
								"& > div:nth-of-type(3n+2) .facility-popout": { left: "calc(-100% - 16px)", width: "calc(300% + 32px)", borderTopLeftRadius: 12, borderTopRightRadius: 12 },
								"& > div:nth-of-type(3n) .facility-popout": { left: "calc(-200% - 32px)", width: "calc(300% + 32px)", borderTopLeftRadius: 12, borderTopRightRadius: 0 },
							},
							"@media (min-width: 900px)": {
								"& > div:nth-of-type(4n+1) .facility-popout": { left: 0, width: "calc(400% + 48px)", borderTopLeftRadius: 0, borderTopRightRadius: 12 },
								"& > div:nth-of-type(4n+2) .facility-popout": { left: "calc(-100% - 16px)", width: "calc(400% + 48px)", borderTopLeftRadius: 12, borderTopRightRadius: 12 },
								"& > div:nth-of-type(4n+3) .facility-popout": { left: "calc(-200% - 32px)", width: "calc(400% + 48px)", borderTopLeftRadius: 12, borderTopRightRadius: 12 },
								"& > div:nth-of-type(4n) .facility-popout": { left: "calc(-300% - 48px)", width: "calc(400% + 48px)", borderTopLeftRadius: 12, borderTopRightRadius: 0 },
							},
						}}
					>
						{items.map((facility) => {
							const isSelected = selectedIds.has(facility.id);
							const isEditing = editFacilityId === facility.id;
							const entry = form.facilities.find((f) => f.id === facility.id);

							return (
								<Grid size={{ xs: 6, sm: 4, md: 3 }} key={facility.id} sx={{ zIndex: isEditing ? 10 : 1 }}>
									<Box sx={{ position: "relative" }}>
										<FacilityCard
											facility={facility}
											entry={entry}
											isSelected={isSelected}
											isEditing={isEditing}
											onSelect={() => handleSelect(facility)}
											onDeselect={() => handleDeselect(facility.id)}
											onEdit={() => entry && openEditInline(entry)}
										/>

										{isEditing && (
											<FacilityEditPopout
												fee={editFee}
												onFeeChange={setEditFee}
												note={editNote}
												onNoteChange={setEditNote}
												onSave={handleSaveInline}
												onCancel={closeEditInline}
											/>
										)}
									</Box>
								</Grid>
							);
						})}
					</Grid>
				</Box>
			))}
		</Box>
	);
};

export default StepFacilityBox;
