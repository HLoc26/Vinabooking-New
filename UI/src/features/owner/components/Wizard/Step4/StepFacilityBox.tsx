import { Box, Typography, Grid, Chip, CircularProgress } from "@mui/material";
import { useOwnerFacilities } from "../../../hooks/useOwnerFacilities";
import { useUpdateFacilities } from "../../../hooks/useUpdateFacilities";
import type { WizardForm } from "../../../types/owner.types";
import { EFacilityType, type FacilityConfig } from "../../../../accommodation/types/accommodation.types";
import { useState, useMemo, useRef, useEffect } from "react";
import type React from "react";

// Sub-components
import FacilityCard from "./FacilityCard";
import FacilityEditPopout from "./FacilityEditPopout";
import { usePushNotificationContext } from "../../../../../context/PushNotification/hook";

interface StepFacilityBoxProps {
	form: WizardForm;
	setForm: React.Dispatch<React.SetStateAction<WizardForm>>;
	triggerSubmit: boolean;
	resetTrigger: () => void;
	onSuccess: () => void;
}

const StepFacilityBox: React.FC<StepFacilityBoxProps> = ({ form, setForm, triggerSubmit, resetTrigger, onSuccess }) => {
	const { groupedByType, isLoading, error } = useOwnerFacilities();

	const { pushNotification } = usePushNotificationContext();

	useEffect(() => {
		if (error) {
			pushNotification(error.message, "error");
		}
	}, [error, pushNotification]);

	// API Hook for saving
	const { mutate, isPending } = useUpdateFacilities(form.accommodationId ?? "");

	const [hasChanged, setHasChanged] = useState(false);

	// Flatten the grouped facilities into a single continuous array
	const allFacilities = useMemo(() => {
		if (!groupedByType) return [];
		return Object.values(groupedByType).flat();
	}, [groupedByType]);

	// MEMORY BANK
	const facilityHistoryRef = useRef<Record<string, { fee: number; note: string }>>({});

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

	const handleSelect = (dto: { id: string; name: string }) => {
		if (selectedIds.has(dto.id)) return;

		const pastEdits = facilityHistoryRef.current[dto.id];
		const newEntry: FacilityConfig = {
			id: dto.id,
			name: dto.name,
			fee: pastEdits?.fee ?? 0,
			note: pastEdits?.note ?? "",
			type: EFacilityType.GENERAL,
			description: "",
		};

		setForm((prev) => ({ ...prev, facilities: [...prev.facilities, newEntry] }));
		setHasChanged(true); // Mark as dirty
	};

	const handleDeselect = (id: string) => {
		setForm((prev) => ({ ...prev, facilities: prev.facilities.filter((f) => f.id !== id) }));
		setHasChanged(true); // Mark as dirty
		if (editFacilityId === id) closeEditInline();
	};

	const handleSaveInline = () => {
		if (editFacilityId) {
			facilityHistoryRef.current[editFacilityId] = { fee: editFee, note: editNote };

			setForm((prev) => ({
				...prev,
				facilities: prev.facilities.map((f) => (f.id === editFacilityId ? { ...f, fee: editFee, note: editNote } : f)),
			}));
			setHasChanged(true); // Mark as dirty
		}
		closeEditInline();
	};

	// Submit logic (Triggered by parent component)
	useEffect(() => {
		if (!triggerSubmit) return;

		// Skip API call if nothing changed
		if (!hasChanged && form.accommodationId) {
			resetTrigger();
			onSuccess();
			return;
		}

		// Execute Mutation
		mutate(
			{ facilities: form.facilities.map((f) => ({ facilityId: f.id, fee: f.fee, note: f.note })) }, // UpdateFacilitiesPayload format
			{
				onSuccess: () => {
					setHasChanged(false); // Reset dirty state
					onSuccess();
				},
				onSettled: resetTrigger,
			}
		);
	}, [triggerSubmit]);

	if (isLoading)
		return (
			<Box display="flex" justifyContent="center" py={6}>
				<CircularProgress />
			</Box>
		);

	return (
		<Box>
			<Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
				<Box>
					<Typography variant="h6" fontWeight={700}>
						Select Facilities & Amenities
					</Typography>

					<Typography variant="body2" color="text.secondary" mt={0.5}>
						Click a tile to select it. Hover selected items to configure fees and notes.
					</Typography>
				</Box>

				<Box display="flex" alignItems="center" gap={2}>
					{/* Show saving spinner in the header while API is processing */}
					{isPending && <CircularProgress size={20} />}
					{form.facilities.length > 0 && <Chip label={`${form.facilities.length} selected`} color="primary" size="small" />}
				</Box>
			</Box>

			{/* Render all facilities continuously in a single Grid */}
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
				{allFacilities.map((facility) => {
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
									<FacilityEditPopout fee={editFee} onFeeChange={setEditFee} note={editNote} onNoteChange={setEditNote} onSave={handleSaveInline} onCancel={closeEditInline} />
								)}
							</Box>
						</Grid>
					);
				})}
			</Grid>
		</Box>
	);
};

export default StepFacilityBox;
