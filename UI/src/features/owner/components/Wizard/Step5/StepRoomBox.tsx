import { useState, useEffect, useRef } from "react";
import { Box, Typography, Button, Stack, Alert, Divider } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import type { RoomForm, AmenityConfigForm, WizardForm, CreateRoomDTO, RoomSummary } from "../../../types/owner.types";
import { makeRoom, makeBed, toEViewType, toEPricingType, toEBedType, toEBedSize } from "../../../const/RoomConst";
import { useCreateRoom, useUpdateRoom } from "../../../hooks/useCreateAndUpdateRoom";
import RoomCard from "./RoomCard";
import RoomEditModal from "./RoomEditModal";
import RoomInfoFields from "./RoomInfoField";
import BedList from "./BedList";
import AmenityPicker from "./AmenityPicker";

interface Props {
	form: WizardForm;
	setForm: React.Dispatch<React.SetStateAction<WizardForm>>;
	triggerSave?: boolean;
	onSaveComplete?: () => void;
	onSaveFailed?: () => void;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function toCreateRoomDTO(room: RoomForm, amenities: AmenityConfigForm[]): CreateRoomDTO {
	return {
		name: room.name, // Uses the Room's specific name (e.g. "Entire Villa")
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
			bedType: (toEBedType(b.bedType) as any) === "BUNK" ? "BUNK_BED" : (toEBedType(b.bedType) as any),
			size: toEBedSize(b.size),
			price: b.price ?? 0,
			quantity: b.bedType === "BUNK_BED" ? (b.quantity ?? 1) * 2 : (b.quantity ?? 1),
		})),
		amenityIds: amenities.map((a) => a.amenityId),
	};
}

/** * Logic to distinguish between a Frontend Random String (Nanoid) and a Backend UUID.
 * Backend UUIDs are 36 chars; Nanoids are ~21.
 */
const isRealServerId = (id?: string) => !!id && id.length > 25 && !id.startsWith("local-");

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function StepRoomsBox({ form, setForm, triggerSave, onSaveComplete, onSaveFailed }: Props) {
	const accommodationId = form.accommodationId ?? "";
	const isEntirePlace = form.rentalType === "ENTIRE_PLACE";
	const rooms = form.rooms ?? [];

	// ── STATE ──
	// For Entire Place, we work directly on this "inline" room
	const [inlineRoom, setInlineRoom] = useState<RoomForm>(() => (rooms.length > 0 ? rooms[0] : makeRoom()));
	const [inlineAmenities, setInlineAmenities] = useState<AmenityConfigForm[]>(rooms.length > 0 ? rooms[0].amenities : []);

	// For Shared/Private rooms, we use a modal
	const [editingRoom, setEditingRoom] = useState<RoomForm | null>(null);
	const [draftAmenities, setDraftAmenities] = useState<AmenityConfigForm[]>([]);

	// ── MUTATIONS ──
	const createMutation = useCreateRoom(accommodationId);

	// Determine which ID to target for the PATCH request
	const activeId = isEntirePlace ? inlineRoom.id : editingRoom?.id;
	const hasPersisted = isRealServerId(activeId);
	const updateMutation = useUpdateRoom(accommodationId, hasPersisted ? activeId! : "");

	const apiError = createMutation.error?.message ?? updateMutation.error?.message ?? null;

	// Keep refs to prevent the useEffect from seeing stale state during the save trigger
	const stateRef = useRef({ inlineRoom, inlineAmenities });
	useEffect(() => {
		stateRef.current = { inlineRoom, inlineAmenities };
	}, [inlineRoom, inlineAmenities]);

	// ── ENTIRE PLACE AUTO-SAVE EFFECT ──
	useEffect(() => {
		if (!isEntirePlace || !triggerSave) return;

		const { inlineRoom: currentRoom, inlineAmenities: currentAmenities } = stateRef.current;

		// Validate
		if (!currentRoom.name.trim()) {
			onSaveFailed?.();
			return;
		}

		const payload = toCreateRoomDTO(currentRoom, currentAmenities);
		const currentlySaved = isRealServerId(currentRoom.id);

		const onSuccess = (saved: RoomSummary) => {
			const updatedRoom: RoomForm = {
				...currentRoom,
				id: saved.id, // Update state with the real DB UUID
				amenities: currentAmenities,
			};
			setInlineRoom(updatedRoom);
			setForm((prev) => ({ ...prev, rooms: [updatedRoom] }));
			onSaveComplete?.();
		};

		if (currentlySaved) {
			updateMutation.mutate(payload, { onSuccess });
		} else {
			// First time: POST /owners/accommodations/{accommodationId}/rooms
			createMutation.mutate(payload, { onSuccess });
		}
	}, [triggerSave, isEntirePlace]);

	// ── HANDLERS ──
	const handleToggleAmenity = (setter: React.Dispatch<React.SetStateAction<AmenityConfigForm[]>>) => (a: AmenityConfigForm) => {
		setter((prev) => (prev.some((x) => x.amenityId === a.amenityId) ? prev.filter((x) => x.amenityId !== a.amenityId) : [...prev, a]));
	};

	// ── RENDER ──
	if (isEntirePlace) {
		return (
			<Box>
				<Typography variant="h6" fontWeight={700} mb={2}>
					Room Details
				</Typography>
				{apiError && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{apiError}
					</Alert>
				)}

				<RoomInfoFields draft={inlineRoom} set={(f, v) => setInlineRoom((p) => ({ ...p, [f]: v }))} rentalType={form.rentalType} />
				<Divider sx={{ my: 3 }} />

				<BedList
					beds={inlineRoom.beds}
					onAdd={() => setInlineRoom((p) => ({ ...p, beds: [...p.beds, makeBed()] }))}
					onRemove={(id) => setInlineRoom((p) => ({ ...p, beds: p.beds.filter((b) => b.id !== id) }))}
					onUpdate={(id, f, v) => setInlineRoom((p) => ({ ...p, beds: p.beds.map((b) => (b.id === id ? { ...b, [f]: v } : b)) }))}
					rentalType={form.rentalType}
				/>
				<Divider sx={{ my: 3 }} />

				<AmenityPicker selected={inlineAmenities} onToggle={handleToggleAmenity(setInlineAmenities)} />
			</Box>
		);
	}

	return (
		<Box>
			<Box display="flex" justifyContent="space-between" mb={3}>
				<Typography variant="h6" fontWeight={700}>
					Manage Rooms
				</Typography>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={() => {
						setEditingRoom(makeRoom());
						setDraftAmenities([]);
					}}
				>
					Add Room
				</Button>
			</Box>

			<Stack spacing={2}>
				{rooms.map((room) => (
					<RoomCard
						key={room.id}
						room={room}
						onEdit={() => {
							setEditingRoom(room);
							setDraftAmenities(room.amenities);
						}}
						onDelete={() => setForm((p) => ({ ...p, rooms: p.rooms.filter((r) => r.id !== room.id) }))}
					/>
				))}
			</Stack>

			{editingRoom && (
				<RoomEditModal
					open
					room={editingRoom}
					draftAmenities={draftAmenities}
					onAmenityToggle={handleToggleAmenity(setDraftAmenities)}
					rentalType={form.rentalType}
					isSaving={createMutation.isPending || updateMutation.isPending}
					onClose={() => setEditingRoom(null)}
					onSave={(updated) => {
						const payload = toCreateRoomDTO(updated, draftAmenities);
						const persisted = isRealServerId(updated.id);

						const onSuccess = (saved: RoomSummary) => {
							const savedRoom = { ...updated, id: saved.id, amenities: draftAmenities };
							setForm((prev) => ({
								...prev,
								rooms: persisted ? prev.rooms.map((r) => (r.id === updated.id ? savedRoom : r)) : [...prev.rooms, savedRoom],
							}));
							setEditingRoom(null);
						};

						if (persisted) updateMutation.mutate(payload, { onSuccess });
						else createMutation.mutate(payload, { onSuccess });
					}}
				/>
			)}
		</Box>
	);
}
