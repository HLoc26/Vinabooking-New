import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, IconButton, Divider, Box, CircularProgress, Alert, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import type { RoomForm, BedForm, AmenityConfigForm } from "../../../types/owner.types";
import { makeBed } from "../../../const/RoomConst";

import RoomInfoFields from "./RoomInfoField";
import BedList from "./BedList";
import AmenityPicker from "./AmenityPicker";
import { usePushNotificationContext } from "../../../../../context/PushNotification/hook";
import { validateRoomForSave } from "./validators";
import type { EAccommodationType, ERentalType } from "../../../../accommodation/types/accommodation.types";

interface Props {
	room: RoomForm;
	open: boolean;
	onClose: () => void;
	onSave: (room: RoomForm) => void;
	draftAmenities: AmenityConfigForm[];
	onAmenityToggle: (a: AmenityConfigForm) => void;
	rentalType: ERentalType;
	accommodationType: EAccommodationType;
	isSaving?: boolean;
}

export default function RoomEditModal({ room, open, onClose, onSave, draftAmenities, onAmenityToggle, rentalType, accommodationType, isSaving = false }: Props) {
	const { pushNotification } = usePushNotificationContext();
	const [draft, setDraft] = useState<RoomForm>({
		...room,
		beds: [...room.beds],
		amenities: [...room.amenities],
	});

	console.log("RoomEditModal", room);

	const set = <K extends keyof RoomForm>(field: K, value: RoomForm[K]) => {
		setDraft((prev) => {
			if (prev[field] === value) return prev;
			return { ...prev, [field]: value };
		});
	};

	const addBed = () => setDraft((prev) => ({ ...prev, beds: [...prev.beds, makeBed()] }));
	const removeBed = (id: string) => setDraft((prev) => ({ ...prev, beds: prev.beds.filter((b) => b.id !== id) }));
	const updateBed = <K extends keyof BedForm>(id: string, field: K, value: BedForm[K]) =>
		setDraft((prev) => ({
			...prev,
			beds: prev.beds.map((b) => (b.id === id ? { ...b, [field]: value } : b)),
		}));

	const { isValid: isValidData, errors: validationErrors } = validateRoomForSave(draft, rentalType, accommodationType);
	const isSaveDisabled = isSaving || !isValidData;

	const handleSave = () => {
		if (isSaveDisabled) return;

		console.log("[RoomEditModal] Save triggered. Current draft:", draft);

		// Run validation again before saving
		const { isValid, errors } = validateRoomForSave(draft, rentalType, accommodationType);

		if (!isValid) {
			console.warn("[RoomEditModal] Validation failed:", errors);
			pushNotification("You have invalid or missing fields", "error");
			return;
		}

		try {
			const isEntirePlace = rentalType === "ENTIRE_PLACE";
			const nameToCheck = (isEntirePlace ? accommodationType : draft.name)?.trim();

			const base = Number(draft.basePrice ?? draft.price) || 0;
			const floor = Number(draft.floorPrice ?? base) || 0;

			onSave({
				...draft,
				name: nameToCheck || "Room",
				basePrice: base,
				floorPrice: floor,
				price: base, // keep for compatibility
			});
		} catch (error) {
			console.error("[RoomEditModal] onSave execution error:", error);
			pushNotification("An unexpected error occurred while saving.", "error");
		}
	};

	const tooltipContent = (
		<Box sx={{ p: 0.5 }}>
			{validationErrors.length > 0 && (
				<>
					<Typography variant="caption">Invalid fields:</Typography>
					<ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
						{validationErrors.map((err, index) => (
							<li key={index}>
								<Typography variant="caption">{err}</Typography>
							</li>
						))}
					</ul>
				</>
			)}
		</Box>
	);

	return (
		<Dialog
			open={open}
			onClose={() => !isSaving && onClose()}
			fullWidth
			maxWidth="md"
			disableEnforceFocus
			slotProps={{
				paper: { sx: { borderRadius: 3, overflow: "hidden" } },
			}}
		>
			{/* HEADER */}
			<DialogTitle
				component="div"
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					bgcolor: "primary.main",
					color: "primary.contrastText",
					py: 1.5,
					px: 3,
				}}
			>
				<Typography variant="h6" fontWeight={700} color="inherit">
					{draft.name || "Edit Room"}
				</Typography>
				<IconButton onClick={onClose} size="small" sx={{ color: "primary.contrastText" }} disabled={isSaving}>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			{/* CONTENT */}
			<DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 3, bgcolor: "background.paper" }}>
				<RoomInfoFields draft={draft} set={set} rentalType={rentalType} />
				<Divider />
				<BedList beds={draft.beds} onAdd={addBed} onRemove={removeBed} onUpdate={updateBed} rentalType={rentalType} />
				<Divider />
				<AmenityPicker selected={draftAmenities} onToggle={onAmenityToggle} />
			</DialogContent>

			{/* FOOTER */}
			<DialogActions
				sx={{
					px: 3,
					py: 2,
					bgcolor: "background.paper",
					flexDirection: "column",
					alignItems: "stretch",
					gap: 1,
				}}
			>
				<Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
					<Box sx={{ flexGrow: 1, minWidth: 0 }}>
						{validationErrors.length > 0 && !isSaving && (
							<Tooltip
								title={tooltipContent} // Pass the JSX list here
								arrow
								placement="top"
							>
								<Alert severity="error" sx={{ borderRadius: 2, py: 0.5, display: "flex", alignItems: "center" }}>
									<Typography
										variant="body2"
										sx={{
											overflow: "hidden",
											textOverflow: "ellipsis",
											whiteSpace: "nowrap",
											display: "block",
										}}
									>
										{/* Keep the comma-separated string for the collapsed Alert view */}
										{`Invalid fields: ${validationErrors.join(", ")}`}
									</Typography>
								</Alert>
							</Tooltip>
						)}
					</Box>

					<Box display="flex" justifyContent="flex-end" gap={1} sx={{ flexShrink: 0 }}>
						<Button onClick={onClose} variant="outlined" disabled={isSaving}>
							Cancel
						</Button>
						<Button onClick={handleSave} variant="contained" disabled={isSaveDisabled} startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : undefined}>
							{isSaving ? "Saving…" : "Save Room"}
						</Button>
					</Box>
				</Box>
			</DialogActions>
		</Dialog>
	);
}
