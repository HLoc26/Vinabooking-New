import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, IconButton, Divider } from "@mui/material";
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
}

export default function RoomEditModal({ room, open, onClose, onSave }: Props) {
	const [draft, setDraft] = useState<RoomForm>({
		...room,
		beds: [...room.beds],
		amenities: [...room.amenities],
	});

	// Generic field setter passed down to RoomInfoFields
	const set = (field: keyof RoomForm, value: any) => setDraft((prev) => ({ ...prev, [field]: value }));

	// Bed handlers passed down to BedList
	const addBed = () => setDraft((prev) => ({ ...prev, beds: [...prev.beds, makeBed()] }));

	const removeBed = (id: string) => setDraft((prev) => ({ ...prev, beds: prev.beds.filter((b) => b.id !== id) }));

	const updateBed = (id: string, field: keyof BedForm, value: any) =>
		setDraft((prev) => ({
			...prev,
			beds: prev.beds.map((b) => (b.id === id ? { ...b, [field]: value } : b)),
		}));

	// Amenity toggle passed down to AmenityPicker
	const toggleAmenity = (amenity: AmenityConfigForm) => {
		setDraft((prev) => {
			const exists = prev.amenities.find((a) => a.amenityId === amenity.amenityId);
			return {
				...prev,
				amenities: exists ? prev.amenities.filter((a) => a.amenityId !== amenity.amenityId) : [...prev.amenities, { ...amenity }],
			};
		});
	};

	const handleSave = () => {
		if (!draft.name.trim()) return;
		onSave(draft);
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
			<DialogTitle
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					pb: 1,
				}}
			>
				<Typography variant="h6" fontWeight={700}>
					{draft.name || "Edit Room"}
				</Typography>
				<IconButton onClick={onClose} size="small">
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			<DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
				<RoomInfoFields draft={draft} set={set} />

				<Divider />

				<BedList beds={draft.beds} onAdd={addBed} onRemove={removeBed} onUpdate={updateBed} />

				<Divider />

				<AmenityPicker selected={draft.amenities} onToggle={toggleAmenity} />
			</DialogContent>

			<DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
				<Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>
					Cancel
				</Button>
				<Button onClick={handleSave} variant="contained" disabled={!draft.name.trim()} sx={{ borderRadius: 2, fontWeight: 700 }}>
					Save Room
				</Button>
			</DialogActions>
		</Dialog>
	);
}
