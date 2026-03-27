import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, IconButton, Divider, Box } from "@mui/material";
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
	isPanelOpen: boolean;
}

export default function RoomEditModal({ room, open, onClose, onSave, draftAmenities, onAmenityToggle, isPanelOpen }: Props) {
	const [draft, setDraft] = useState<RoomForm>({
		...room,
		beds: [...room.beds],
		amenities: [], // controlled by parent
	});

	const set = (field: keyof RoomForm, value: any) => setDraft((prev) => ({ ...prev, [field]: value }));

	const addBed = () => setDraft((prev) => ({ ...prev, beds: [...prev.beds, makeBed()] }));

	const removeBed = (id: string) =>
		setDraft((prev) => ({
			...prev,
			beds: prev.beds.filter((b) => b.id !== id),
		}));

	const updateBed = (id: string, field: keyof BedForm, value: any) =>
		setDraft((prev) => ({
			...prev,
			beds: prev.beds.map((b) => (b.id === id ? { ...b, [field]: value } : b)),
		}));

	const handleSave = () => {
		if (!draft.name.trim()) return;
		onSave(draft);
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
			maxWidth="lg"
			disableEnforceFocus
			PaperProps={{
				sx: {
					borderRadius: 3,

					// 👇 shrink when AmenityPanel is open (space on right)
					width: isPanelOpen ? "calc(100% - 320px)" : "100%",
					transition: "width 0.25s ease",
				},
			}}
		>
			{/* HEADER */}
			<DialogTitle
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<Typography variant="h6" fontWeight={700}>
					{draft.name || "Edit Room"}
				</Typography>
				<IconButton onClick={onClose}>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			{/* CONTENT */}
			<DialogContent
				dividers
				sx={{
					display: "flex",
					flexDirection: "column",
					gap: 3,
				}}
			>
				{/* ─── ROOM INFO (CHILD COMPONENT) ───────────────── */}
				<RoomInfoFields draft={draft} set={set} />

				<Divider />

				{/* ─── BEDS ───────────────── */}
				<BedList beds={draft.beds} onAdd={addBed} onRemove={removeBed} onUpdate={updateBed} />

				<Divider />

				{/* ─── AMENITIES ───────────────── */}
				<Box>
					<AmenityPicker selected={draftAmenities} onToggle={onAmenityToggle} />
				</Box>
			</DialogContent>

			{/* FOOTER */}
			<DialogActions sx={{ px: 3, py: 2 }}>
				<Button onClick={onClose} variant="outlined">
					Cancel
				</Button>
				<Button onClick={handleSave} variant="contained" disabled={!draft.name.trim()}>
					Save Room
				</Button>
			</DialogActions>
		</Dialog>
	);
}
