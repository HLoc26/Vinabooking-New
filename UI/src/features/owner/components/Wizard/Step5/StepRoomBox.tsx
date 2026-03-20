import { useState } from "react";
import { Box, Typography, Button, Paper, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import KingBedOutlinedIcon from "@mui/icons-material/KingBedOutlined";
import type { RoomForm, WizardForm } from "../../../types/owner.types";
import { makeRoom } from "../../../const/RoomConst";
import RoomCard from "./RoomCard";
import RoomEditModal from "./RoomEditModal";

interface Props {
	form: WizardForm;
	setForm: React.Dispatch<React.SetStateAction<WizardForm>>;
}

export default function StepRoomsBox({ form, setForm }: Props) {
	const rooms: RoomForm[] = form.rooms ?? [];
	const [editingRoom, setEditingRoom] = useState<RoomForm | null>(null);
	const [isNew, setIsNew] = useState(false);

	const openNew = () => {
		setIsNew(true);
		setEditingRoom(makeRoom());
	};

	const openEdit = (room: RoomForm) => {
		setIsNew(false);
		setEditingRoom({ ...room, beds: [...room.beds], amenities: [...room.amenities] });
	};

	const handleSave = (updated: RoomForm) => {
		setForm((prev) => ({
			...prev,
			rooms: isNew ? [...prev.rooms, updated] : prev.rooms.map((r) => (r.id === updated.id ? updated : r)),
		}));
		setEditingRoom(null);
	};

	const handleDelete = (id: string) => {
		setForm((prev) => ({ ...prev, rooms: prev.rooms.filter((r) => r.id !== id) }));
	};

	return (
		<Box>
			{/* Header */}
			<Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
				<Box>
					<Typography variant="h6" fontWeight={700} mb={0.5}>
						Rooms
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Add the rooms available in your property. Each room can have its own beds and amenities.
					</Typography>
				</Box>
				<Button variant="contained" startIcon={<AddIcon />} onClick={openNew} sx={{ borderRadius: 2, fontWeight: 700, whiteSpace: "nowrap", ml: 2 }}>
					Add Room
				</Button>
			</Box>

			{/* Room list or empty state */}
			{rooms.length === 0 ? (
				<Paper
					elevation={0}
					sx={{
						p: 6,
						borderRadius: 3,
						border: "2px dashed",
						borderColor: "divider",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: 2,
					}}
				>
					<KingBedOutlinedIcon sx={{ fontSize: 48, color: "text.disabled" }} />
					<Typography color="text.secondary" variant="body1">
						No rooms added yet
					</Typography>
					<Button variant="outlined" startIcon={<AddIcon />} onClick={openNew} sx={{ borderRadius: 2 }}>
						Add Your First Room
					</Button>
				</Paper>
			) : (
				<Stack spacing={2}>
					{rooms.map((room) => (
						<RoomCard key={room.id} room={room} onEdit={() => openEdit(room)} onDelete={() => handleDelete(room.id)} />
					))}
				</Stack>
			)}

			{/* Edit / Create modal */}
			{editingRoom && <RoomEditModal open room={editingRoom} onClose={() => setEditingRoom(null)} onSave={handleSave} />}
		</Box>
	);
}
