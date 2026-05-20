import { useState, useMemo, useRef, useEffect } from "react";
import { Box, Typography, Button, Paper, CircularProgress, Grid, Chip, Popover } from "@mui/material";
import { EditOutlined, Close, Check, SpaOutlined } from "@mui/icons-material";
import { useQueryClient } from "@tanstack/react-query";

import { usePushNotificationContext } from "../../../../../context/PushNotification/hook";
import useModalContext from "../../../../../context/ModalContext/hook";
import { useOwnerFacilities } from "../../../hooks/useOwnerFacilities";
import { useUpdateFacilities } from "../../../hooks/useUpdateFacilities";
import { FieldLabel, getCardSx, getHeaderSx } from "../shared/CardSharedUI";
import { getFacilityIcon } from "../../../const/FacilityConst";
import FacilityCard from "../../Wizard/Step4/FacilityCard";
import FacilityEditPopout from "../../Wizard/Step4/FacilityEditPopout";
import type { AccommodationSummary } from "../../../types/owner.types";
import type { FacilityConfig } from "../../../../accommodation/types/accommodation.types";

interface Props {
	accommodationId: string;
	initialFacilities: AccommodationSummary["facilities"];
}

interface FormFacility {
	facilityId: string;
	fee: number;
	note: string;
	name: string;
}

export const ManageFacilitiesCard = ({ accommodationId, initialFacilities }: Props) => {
	const queryClient = useQueryClient();
	const { pushNotification } = usePushNotificationContext();
	const { openModal, closeModal } = useModalContext();

	// Data Hooks
	const { data: masterFacilities = [], isLoading: isMasterLoading } = useOwnerFacilities();
	const { mutate: updateMutate, isPending } = useUpdateFacilities(accommodationId);

	// State
	const [isEditing, setIsEditing] = useState(false);
	const [isDirty, setIsDirty] = useState(false);
	const [selectedFacilities, setSelectedFacilities] = useState<FormFacility[]>([]);

	useEffect(() => {
		setSelectedFacilities(initialFacilities.map((f) => ({ facilityId: f.id, fee: f.fee, note: f.note || "", name: f.name })));
		setIsDirty(false);
	}, [initialFacilities]);

	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const [editFacilityId, setEditFacilityId] = useState<string | null>(null);
	const [editFee, setEditFee] = useState<number>(0);
	const [editNote, setEditNote] = useState<string>("");

	const facilityHistoryRef = useRef<Record<string, { fee: number; note: string }>>({});

	// =========================================================================
	// LOGIC FOR EDIT MODE
	// =========================================================================
	const openEditInline = (f: FormFacility, event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
		setEditFacilityId(f.facilityId);
		setEditFee(f.fee);
		setEditNote(f.note);
	};

	const closeEditInline = () => {
		setAnchorEl(null);
		setEditFacilityId(null);
	};

	const handleSelect = (id: string, name: string) => {
		if (selectedFacilities.some((f) => f.facilityId === id)) return;
		const pastEdits = facilityHistoryRef.current[id];
		setSelectedFacilities((prev) => [...prev, { facilityId: id, name, fee: pastEdits?.fee ?? 0, note: pastEdits?.note ?? "" }]);
		setIsDirty(true);
	};

	const handleDeselect = (id: string) => {
		setSelectedFacilities((prev) => prev.filter((f) => f.facilityId !== id));
		setIsDirty(true);
		if (editFacilityId === id) closeEditInline();
	};

	const handleSaveInline = () => {
		if (editFacilityId) {
			facilityHistoryRef.current[editFacilityId] = { fee: editFee, note: editNote };
			setSelectedFacilities((prev) => prev.map((f) => (f.facilityId === editFacilityId ? { ...f, fee: editFee, note: editNote } : f)));
			setIsDirty(true);
		}
		closeEditInline();
	};

	// =========================================================================
	// LOGIC FOR SUBMIT
	// =========================================================================
	const executeSave = () => {
		const payload = {
			facilities: selectedFacilities.map((f) => ({
				facilityId: f.facilityId,
				fee: f.fee,
				note: f.note || null,
			})),
		};

		updateMutate(payload, {
			onSuccess: () => {
				pushNotification("Facilities updated successfully!", "success");
				queryClient.invalidateQueries({ queryKey: ["accommodationManage", accommodationId] });
				setIsEditing(false);
				setIsDirty(false);
			},
			onError: () => pushNotification("Failed to update facilities. Please try again.", "error"),
		});
	};

	const handleCancel = () => {
		if (!isDirty) {
			setIsEditing(false);
			return;
		}
		openModal(
			<Box sx={{ p: 3, maxWidth: 400 }}>
				<Typography variant="h6" fontWeight={700} mb={1}>
					Discard Changes?
				</Typography>
				<Typography variant="body2" color="text.secondary" mb={3}>
					You have unsaved changes. Are you sure you want to discard them?
				</Typography>
				<Box display="flex" justifyContent="flex-end" gap={1.5}>
					<Button variant="text" color="inherit" onClick={closeModal} sx={{ fontWeight: 600 }}>
						Keep Editing
					</Button>
					<Button
						variant="contained"
						color="error"
						onClick={() => {
							setSelectedFacilities(initialFacilities.map((f) => ({ facilityId: f.id, fee: f.fee, note: f.note || "", name: f.name })));
							setIsEditing(false);
							setIsDirty(false);
							closeModal();
						}}
						sx={{ fontWeight: 600 }}
					>
						Discard
					</Button>
				</Box>
			</Box>
		);
	};

	// =========================================================================
	// RENDER HELPERS
	// =========================================================================
	const groupedSelected = useMemo(() => {
		const result: Record<string, FormFacility[]> = {};
		selectedFacilities.forEach((f) => {
			const master = masterFacilities.find((m) => m.id === f.facilityId);
			const type = master ? master.type : "OTHER";
			if (!result[type]) result[type] = [];
			result[type].push(f);
		});
		return result;
	}, [selectedFacilities, masterFacilities]);

	if (isMasterLoading) {
		return (
			<Paper sx={{ p: 4, borderRadius: 3, minHeight: 400, display: "flex", justifyContent: "center", alignItems: "center" }}>
				<CircularProgress />
			</Paper>
		);
	}

	return (
		<Paper elevation={0} sx={getCardSx(isEditing)}>
			{/* ── HEADER ── */}
			<Box sx={getHeaderSx(isEditing)}>
				<Box display="flex" alignItems="center" gap={1.5}>
					<Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
						<SpaOutlined sx={{ fontSize: "1.1rem", color: "text.secondary" }} />
					</Box>
					<Box>
						<Typography variant="subtitle1" fontWeight={700} lineHeight={1.2} sx={{ fontSize: "0.95rem" }}>
							Facilities & Services
						</Typography>
						<Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.75rem" }}>
							Highlight the amenities your property offers
						</Typography>
					</Box>
				</Box>

				{isEditing ? (
					<Box display="flex" gap={1} alignItems="center">
						<Button
							variant="text"
							size="small"
							color="inherit"
							startIcon={<Close sx={{ fontSize: "0.9rem !important" }} />}
							onClick={handleCancel}
							disabled={isPending}
							sx={{
								borderRadius: "10px",
								fontWeight: 600,
								textTransform: "none",
								fontSize: "0.8rem",
								color: "text.secondary",
								px: 1.5,
								"&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
							}}
						>
							Cancel
						</Button>
						<Button
							variant="contained"
							size="small"
							color="primary"
							onClick={executeSave}
							startIcon={isPending ? <CircularProgress size={13} color="inherit" /> : <Check sx={{ fontSize: "0.9rem !important" }} />}
							disabled={isPending || !isDirty}
							sx={{ borderRadius: "10px", fontWeight: 700, textTransform: "none", fontSize: "0.8rem", px: 2, boxShadow: "none", "&:hover": { boxShadow: "none" } }}
						>
							Save changes
						</Button>
					</Box>
				) : (
					<Button
						variant="outlined"
						size="small"
						color="inherit"
						startIcon={<EditOutlined sx={{ fontSize: "0.9rem !important" }} />}
						onClick={() => setIsEditing(true)}
						sx={{
							borderRadius: "10px",
							fontWeight: 600,
							textTransform: "none",
							fontSize: "0.8rem",
							px: 1.75,
							borderColor: "rgba(255,255,255,0.15)",
							color: "text.secondary",
							"&:hover": { borderColor: "rgba(255,255,255,0.4)", bgcolor: "rgba(255,255,255,0.05)", color: "text.primary" },
						}}
					>
						Edit
					</Button>
				)}
			</Box>

			{/* ── BODY ── */}
			<Box sx={{ px: 3.5, py: 3 }}>
				{isEditing ? (
					/* ================= EDIT MODE ================= */
					<Box>
						<Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
							<Typography variant="body2" color="text.secondary">
								Click a tile to select it. Hover selected items to configure fees and notes.
							</Typography>
							<Chip label={`${selectedFacilities.length} selected`} color="primary" size="small" sx={{ fontWeight: 600 }} />
						</Box>

						<Grid container spacing={2}>
							{masterFacilities.map((facility) => {
								const selectedEntry = selectedFacilities.find((f) => f.facilityId === facility.id);
								const isSelected = !!selectedEntry;
								const isEditingPopout = editFacilityId === facility.id;

								const mappedEntry: FacilityConfig | undefined = selectedEntry
									? { id: facility.id, name: facility.name, type: facility.type, description: facility.description || "", fee: selectedEntry.fee, note: selectedEntry.note }
									: undefined;

								return (
									<Grid size={{ xs: 6, sm: 4, md: 3 }} key={facility.id}>
										<FacilityCard
											facility={facility}
											entry={mappedEntry}
											isSelected={isSelected}
											isEditing={isEditingPopout}
											onSelect={() => handleSelect(facility.id, facility.name)}
											onDeselect={() => handleDeselect(facility.id)}
											onEdit={(e) => selectedEntry && openEditInline(selectedEntry, e)}
										/>
									</Grid>
								);
							})}
						</Grid>

						<Popover
							open={Boolean(anchorEl)}
							anchorEl={anchorEl}
							onClose={closeEditInline}
							anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
							transformOrigin={{ vertical: "top", horizontal: "center" }}
							slotProps={{ paper: { sx: { mt: 1, overflow: "visible", borderRadius: 2, bgcolor: "background.paper", backgroundImage: "none" } } }}
						>
							<FacilityEditPopout fee={editFee} onFeeChange={setEditFee} note={editNote} onNoteChange={setEditNote} onSave={handleSaveInline} onCancel={closeEditInline} />
						</Popover>
					</Box>
				) : (
					/* ================= VIEW MODE ================= */
					<Box display="flex" flexDirection="column" gap={4}>
						{Object.keys(groupedSelected).length === 0 ? (
							<Typography variant="body2" color="text.secondary" fontStyle="italic">
								No facilities have been configured yet. Click Edit to add some.
							</Typography>
						) : (
							Object.entries(groupedSelected).map(([type, facs]) => (
								<Box key={type}>
									<FieldLabel>{type.replaceAll("_", " ")}</FieldLabel>
									<Box display="flex" gap={1.5} flexWrap="wrap" mt={1.5}>
										{facs.map((f) => {
											const Icon = getFacilityIcon(f.name);
											return (
												<Chip
													key={f.facilityId}
													icon={<Icon style={{ fontSize: 16 }} />}
													label={
														<Box display="flex" alignItems="center" gap={1}>
															<Typography variant="body2" fontWeight={600} fontSize="0.85rem">
																{f.name}
															</Typography>
															{f.fee > 0 && (
																<Typography
																	variant="caption"
																	sx={{
																		bgcolor: "warning.dark",
																		color: "warning.contrastText",
																		px: 0.75,
																		py: 0.25,
																		borderRadius: 1,
																		fontWeight: 700,
																		fontSize: "0.65rem",
																	}}
																>
																	{f.fee.toLocaleString()}₫
																</Typography>
															)}
														</Box>
													}
													sx={{
														py: 2.5,
														px: 0.5,
														borderRadius: "12px",
														bgcolor: "rgba(255,255,255,0.04)",
														border: "1px solid rgba(255,255,255,0.05)",
														color: "text.primary",
														"& .MuiChip-icon": { color: "primary.main", ml: 1 },
													}}
												/>
											);
										})}
									</Box>
								</Box>
							))
						)}
					</Box>
				)}
			</Box>
		</Paper>
	);
};
