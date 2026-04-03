import { useState } from "react";
import { Box, Typography, Button, Paper, Stack, Alert } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import KingBedOutlinedIcon from "@mui/icons-material/KingBedOutlined";

import type { RoomForm, AmenityConfigForm, WizardForm, CreateRoomDTO, RoomSummary } from "../../../types/owner.types";
import { makeRoom } from "../../../const/RoomConst";
import { toEViewType, toEPricingType, toEBedType, toEBedSize } from "../../../const/RoomConst";
import { useCreateRoom, useUpdateRoom } from "../../../hooks/useCreateAndUpdateRoom";
import RoomCard from "./RoomCard";
import RoomEditModal from "./RoomEditModal";
import type { ERentalType } from "../../../../accommodation/types/accommodation.types";

interface Props {
	form: WizardForm;
	setForm: React.Dispatch<React.SetStateAction<WizardForm>>;
}

// ─── DTO mapper ───────────────────────────────────────────────────────────────

function toCreateRoomDTO(room: RoomForm, amenities: AmenityConfigForm[]): CreateRoomDTO {
	return {
		name: room.name,
		description: room.description || undefined,
		quantity: room.quantity,
		maxAdults: room.maxAdults,
		maxChildren: room.maxChildren,
		size: room.size,
		bedroomCount: room.bedroomCount,
		bathroomCount: room.bathroomCount,
		viewType: toEViewType(room.viewType),
		viewDescription: room.viewDescription || undefined,
		price: room.price,
		pricingType: toEPricingType(room.pricingType),
		isActive: true,
		beds: room.beds.map((b) => ({
			name: b.name || undefined,
			bedType: toEBedType(b.bedType),
			size: toEBedSize(b.size),
			price: b.price,
		})),
		amenityIds: amenities.map((a) => a.amenityId),
	};
}

// ─── validation ───────────────────────────────────────────────────────────────

function validateRoom(room: RoomForm, amenities: AmenityConfigForm[], rentalType: ERentalType): string | null {
	if (!room.name.trim()) return "Room name is required.";

	if (rentalType === "SHARED_ROOM") {
		const missingPrice = room.beds.some((b) => b.price == null || b.price <= 0);
		if (missingPrice) return "All beds must have a price set for shared room accommodations.";
	}

	return null;
}

// ─── component ───────────────────────────────────────────────────────────────

export default function StepRoomsBox({ form, setForm }: Props) {
	const accommodationId = form.accommodationId ?? "";
	const accommodationType = form.accommodationType ?? "";
	const rooms: RoomForm[] = form.rooms ?? [];

	const [editingRoom, setEditingRoom] = useState<RoomForm | null>(null);
	const [isNew, setIsNew] = useState(false);
	const [draftAmenities, setDraftAmenities] = useState<AmenityConfigForm[]>([]);
	const [validationError, setValidationError] = useState<string | null>(null);

	const createMutation = useCreateRoom(accommodationId);
	const updateMutation = useUpdateRoom(accommodationId, editingRoom?.id ?? "");

	const isSaving = createMutation.isPending || updateMutation.isPending;
	const apiError = createMutation.error?.message ?? updateMutation.error?.message ?? null;

	// ── open / close ──────────────────────────────────────────────────────────

	const openNew = () => {
		setIsNew(true);
		setEditingRoom(makeRoom());
		setDraftAmenities([]);
		setValidationError(null);
		createMutation.reset();
		updateMutation.reset();
	};

	const openEdit = (room: RoomForm) => {
		setIsNew(false);
		setEditingRoom({ ...room, beds: [...room.beds], amenities: [...room.amenities] });
		setDraftAmenities([...room.amenities]);
		setValidationError(null);
		createMutation.reset();
		updateMutation.reset();
	};

	const closeModal = () => {
		if (isSaving) return;
		setEditingRoom(null);
		setDraftAmenities([]);
		setValidationError(null);
	};

	// ── save ──────────────────────────────────────────────────────────────────

	const handleSave = (updated: RoomForm) => {
		// Validate before hitting the API
		const error = validateRoom(updated, draftAmenities, accommodationType);
		if (error) {
			setValidationError(error);
			return;
		}
		setValidationError(null);

		const payload = toCreateRoomDTO(updated, draftAmenities);
		const isPersistedOnServer = !isNew && !!updated.id && !updated.id.startsWith("local-");

		const onSuccess = (saved: RoomSummary) => {
			// Map the server response back to local RoomForm so the card reflects
			// the persisted id and any server-normalised values
			const savedRoom: RoomForm = {
				...updated,
				amenities: draftAmenities,
				id: saved.id,
				price: saved.price ? Number(saved.price) : undefined,
			};

			setForm((prev) => ({
				...prev,
				rooms: isNew ? [...prev.rooms, savedRoom] : prev.rooms.map((r) => (r.id === updated.id ? savedRoom : r)),
			}));

			setEditingRoom(null);
			setDraftAmenities([]);
		};

		if (isPersistedOnServer) {
			updateMutation.mutate(payload, { onSuccess });
		} else {
			createMutation.mutate(payload, { onSuccess });
		}
	};

	// ── delete ────────────────────────────────────────────────────────────────

	const handleDelete = (id: string) => {
		setForm((prev) => ({ ...prev, rooms: prev.rooms.filter((r) => r.id !== id) }));
	};

	// ── amenity toggle ────────────────────────────────────────────────────────

	const handleAmenityToggle = (a: AmenityConfigForm) => {
		const exists = draftAmenities.some((x) => x.amenityId === a.amenityId);
		setDraftAmenities((prev) => (exists ? prev.filter((x) => x.amenityId !== a.amenityId) : [...prev, a]));
	};

	// ── render ────────────────────────────────────────────────────────────────

	return (
		<Box>
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

			{apiError && (
				<Alert
					severity="error"
					onClose={() => {
						createMutation.reset();
						updateMutation.reset();
					}}
					sx={{ mb: 2, borderRadius: 2 }}
				>
					{apiError}
				</Alert>
			)}

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

			{editingRoom && (
				<RoomEditModal
					open
					room={editingRoom}
					draftAmenities={draftAmenities}
					onAmenityToggle={handleAmenityToggle}
					accommodationType={accommodationType}
					isSaving={isSaving}
					validationError={validationError}
					onClose={closeModal}
					onSave={handleSave}
				/>
			)}
		</Box>
	);
}
