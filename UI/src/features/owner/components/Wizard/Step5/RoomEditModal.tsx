import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, IconButton, Divider, Box, CircularProgress, Alert } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import type { RoomForm, BedForm, AmenityConfigForm } from "../../../types/owner.types";
import { makeBed } from "../../../const/RoomConst";

import RoomInfoFields from "./RoomInfoField";
import BedList from "./BedList";
import AmenityPicker from "./AmenityPicker";

interface Props {
	room: RoomForm;
	open: boolean;
	onClose: () => void;
	onSave: (room: RoomForm) => void;
	draftAmenities: AmenityConfigForm[];
	onAmenityToggle: (a: AmenityConfigForm) => void;
	/** Controls bed price / quantity visibility and bedroom/bathroom visibility */
	rentalType?: string;
	/** True while the create/update mutation is in-flight */
	isSaving?: boolean;
	/** Validation error from parent (e.g. missing bed prices) */
	validationError?: string | null;
}

export default function RoomEditModal({ room, open, onClose, onSave, draftAmenities, onAmenityToggle, rentalType, isSaving = false, validationError }: Props) {
	const [draft, setDraft] = useState<RoomForm>({
		...room,
		beds: [...room.beds],
		amenities: [],
	});

	const set = (field: keyof RoomForm, value: any) => setDraft((prev) => ({ ...prev, [field]: value }));

	const addBed = () => setDraft((prev) => ({ ...prev, beds: [...prev.beds, makeBed()] }));

	const removeBed = (id: string) => setDraft((prev) => ({ ...prev, beds: prev.beds.filter((b) => b.id !== id) }));

	const updateBed = (id: string, field: keyof BedForm, value: any) =>
		setDraft((prev) => ({
			...prev,
			beds: prev.beds.map((b) => (b.id === id ? { ...b, [field]: value } : b)),
		}));

	const handleSave = () => {
		if (!draft.name.trim() || isSaving) return;
		onSave(draft);
	};

	return (
		<Dialog
			open={open}
			onClose={() => {
				if (!isSaving) onClose();
			}}
			fullWidth
			maxWidth="lg"
			disableEnforceFocus
			PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
		>
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
				<IconButton
					onClick={() => {
						if (!isSaving) onClose();
					}}
					size="small"
					sx={{ color: "primary.contrastText" }}
					disabled={isSaving}
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			{/* CONTENT */}
			<DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 3, bgcolor: "background.paper" }}>
				{/* Pass rentalType so bedroom/bathroom can be hidden for PRIVATE_ROOM */}
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
				{validationError && (
					<Alert severity="error" sx={{ borderRadius: 2 }}>
						{validationError}
					</Alert>
				)}
				<Box display="flex" justifyContent="flex-end" gap={1}>
					<Button onClick={onClose} variant="outlined" disabled={isSaving}>
						Cancel
					</Button>
					<Button onClick={handleSave} variant="contained" disabled={!draft.name.trim() || isSaving} startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : undefined}>
						{isSaving ? "Saving…" : "Save Room"}
					</Button>
				</Box>
			</DialogActions>
		</Dialog>
	);
}
