import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, IconButton, Divider, Box, CircularProgress, Alert } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import type { RoomForm, BedForm, AmenityConfigForm } from "../../../types/owner.types";
import { makeBed } from "../../../const/RoomConst";

import RoomInfoFields from "./RoomInfoField";
import BedList from "./BedList";
import AmenityPicker from "./AmenityPicker";

const MAX_PRICE = 100000000; // 100 Million VND

interface Props {
	room: RoomForm;
	open: boolean;
	onClose: () => void;
	onSave: (room: RoomForm) => void;
	draftAmenities: AmenityConfigForm[];
	onAmenityToggle: (a: AmenityConfigForm) => void;
	rentalType?: string;
	accommodationType?: string;
	isSaving?: boolean;
	validationError?: string | null;
}

export default function RoomEditModal({ room, open, onClose, onSave, draftAmenities, onAmenityToggle, rentalType, accommodationType, isSaving = false, validationError }: Props) {
	const [draft, setDraft] = useState<RoomForm>({
		...room,
		beds: [...room.beds],
		amenities: [],
	});

	const [internalError, setInternalError] = useState<string | null>(null);

	const set = (field: keyof RoomForm, value: any) => {
		setInternalError(null);
		setDraft((prev) => {
			if (prev[field] === value) return prev;
			return { ...prev, [field]: value };
		});
	};

	const addBed = () => setDraft((prev) => ({ ...prev, beds: [...prev.beds, makeBed()] }));
	const removeBed = (id: string) => setDraft((prev) => ({ ...prev, beds: prev.beds.filter((b) => b.id !== id) }));
	const updateBed = (id: string, field: keyof BedForm, value: any) =>
		setDraft((prev) => ({
			...prev,
			beds: prev.beds.map((b) => (b.id === id ? { ...b, [field]: value } : b)),
		}));

	// ──────────────────────────────────────────────────────────────────────
	// VALIDATION HELPERS
	// ──────────────────────────────────────────────────────────────────────

	const validateRoomData = (): { isValid: boolean; errors: string[] } => {
		const isEntirePlace = rentalType === "ENTIRE_PLACE";
		const nameToCheck = (isEntirePlace ? accommodationType : draft.name)?.trim();
		const priceToCheck = Number(draft.price);

		const errors: string[] = [];

		// Name
		if (!nameToCheck) errors.push("room name is required");

		// Price
		if (isNaN(priceToCheck) || priceToCheck <= 0) {
			errors.push("room price is required");
		} else if (priceToCheck < 1000) {
			errors.push("room price must be at least 1,000 VND");
		} else if (priceToCheck > MAX_PRICE) {
			errors.push("room price exceeds 100,000,000 VND");
		}

		// Guest capacity
		if (draft.maxAdults < 1) errors.push("guest capacity (min 1 adult)");

		// Size
		const size = draft.size ?? 0;
		if (size > 0 && size < 5) errors.push("room size must be at least 5 m²");

		// Bed validation
		if (!draft.beds?.length) {
			errors.push("at least one bed is required");
		} else {
			draft.beds.forEach((bed, i) => {
				if (!bed.name?.trim()) errors.push(`bed #${i + 1} name is required`);
				if (!bed.bedType) errors.push(`bed #${i + 1} type is required`);
				const qty = bed.quantity ?? 1;
				if (!qty || qty < 1) errors.push(`bed #${i + 1} quantity (min 1)`);
				const price = Number(bed.price || 0);
				if (price > MAX_PRICE) errors.push(`bed #${i + 1} price exceeds 100,000,000 VND`);
			});
		}

		return { isValid: errors.length === 0, errors };
	};

	const { isValid: isValidData, errors: validationErrors } = validateRoomData();
	const isSaveDisabled = isSaving || !isValidData;

	const handleSave = () => {
		if (isSaveDisabled) return;

		setInternalError(null);
		console.log("[RoomEditModal] Save triggered. Current draft:", draft);

		// Run validation again before saving
		const { isValid, errors } = validateRoomData();

		if (!isValid) {
			const errorMsg = `Invalid fields: ${errors.join(", ")}`;
			console.warn("[RoomEditModal] Validation failed:", errors);
			setInternalError(errorMsg);
			return;
		}

		try {
			const isEntirePlace = rentalType === "ENTIRE_PLACE";
			const nameToCheck = (isEntirePlace ? accommodationType : draft.name)?.trim();

			onSave({
				...draft,
				name: nameToCheck || "Room",
				price: Number(draft.price) || 0,
			});
		} catch (error) {
			console.error("[RoomEditModal] onSave execution error:", error);
			setInternalError("An unexpected error occurred while saving.");
		}
	};

	return (
		<Dialog open={open} onClose={() => !isSaving && onClose()} fullWidth maxWidth="md" disableEnforceFocus PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}>
			{/* HEADER */}
			<DialogTitle
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
				{/* Display validation errors */}
				{(validationError || internalError || (validationErrors.length > 0 && !isSaving)) && (
					<Alert severity="error" sx={{ borderRadius: 2 }}>
						{internalError || validationError || `Invalid fields: ${validationErrors.join(", ")}`}
					</Alert>
				)}

				<Box display="flex" justifyContent="flex-end" gap={1}>
					<Button onClick={onClose} variant="outlined" disabled={isSaving}>
						Cancel
					</Button>
					<Button onClick={handleSave} variant="contained" disabled={isSaveDisabled} startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : undefined}>
						{isSaving ? "Saving…" : "Save Room"}
					</Button>
				</Box>
			</DialogActions>
		</Dialog>
	);
}
