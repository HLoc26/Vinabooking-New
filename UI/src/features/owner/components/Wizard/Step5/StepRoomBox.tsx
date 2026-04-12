import { useState, useEffect, useRef } from "react";
import { Box, Typography, Button, Stack, Alert, Divider, Paper } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import type { RoomForm, AmenityConfigForm, WizardForm, UpdateRoomDTO, RoomSummary } from "../../../types/owner.types";
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

function toRoomDTO(room: RoomForm, amenities: AmenityConfigForm[], form: WizardForm): UpdateRoomDTO {
	const isEntirePlace = form.rentalType === "ENTIRE_PLACE";
	const rawType = form.accommodationType || "Accommodation";
	const formattedName = rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase();

	return {
		name: isEntirePlace ? formattedName : room.name,
		description: room.description || undefined,
		quantity: room.quantity || 1,
		maxAdults: room.maxAdults || 1,
		maxChildren: room.maxChildren || 0,
		size: room.size || undefined,
		bedroomCount: room.bedroomCount || 0,
		bathroomCount: room.bathroomCount || 0,
		viewType: toEViewType(room.viewType),
		viewDescription: room.viewDescription || undefined,
		price: Number(room.price) || 0,
		pricingType: toEPricingType(room.pricingType),
		isActive: true,
		beds: room.beds.map((b) => ({
			// Gửi ID nếu là UUID thật, gửi undefined nếu là local-id
			id: b.id && b.id.length > 25 && !b.id.startsWith("local-") ? b.id : undefined,
			name: b.name || undefined,
			bedType: toEBedType(b.bedType) as any,
			size: toEBedSize(b.size),
			price: Number(b.price) || 0,
			quantity: b.quantity ?? 1,
		})),
		amenityIds: amenities.map((a) => a.amenityId),
	};
}

const isRealServerId = (id?: string) => !!id && id.length > 25 && !id.startsWith("local-");

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function StepRoomsBox({ form, setForm, triggerSave, onSaveComplete, onSaveFailed }: Props) {
	const accommodationId = form.accommodationId ?? "";
	const isEntirePlace = form.rentalType === "ENTIRE_PLACE";
	const rooms = form.rooms ?? [];

	const [inlineRoom, setInlineRoom] = useState<RoomForm>(() => (rooms.length > 0 ? rooms[0] : makeRoom()));
	const [inlineAmenities, setInlineAmenities] = useState<AmenityConfigForm[]>(rooms.length > 0 ? rooms[0].amenities : []);

	const [editingRoom, setEditingRoom] = useState<RoomForm | null>(null);
	const [draftAmenities, setDraftAmenities] = useState<AmenityConfigForm[]>([]);

	const createMutation = useCreateRoom(accommodationId);

	const activeId = isEntirePlace ? inlineRoom.id : editingRoom?.id;
	const hasPersisted = isRealServerId(activeId);
	const updateMutation = useUpdateRoom(accommodationId, hasPersisted ? activeId! : "");

	const apiError = createMutation.error?.message ?? updateMutation.error?.message ?? null;

	const stateRef = useRef({ inlineRoom, inlineAmenities });
	useEffect(() => {
		stateRef.current = { inlineRoom, inlineAmenities };
	}, [inlineRoom, inlineAmenities]);

	// ── AUTO-SAVE EFFECT (ENTIRE PLACE) ──
	useEffect(() => {
		if (!isEntirePlace || !triggerSave) return;

		const { inlineRoom: currentRoom, inlineAmenities: currentAmenities } = stateRef.current;
		const payload = toRoomDTO(currentRoom, currentAmenities, form);
		const currentlySaved = isRealServerId(currentRoom.id);

		const onSuccess = (saved: RoomSummary) => {
			const updatedRoom: RoomForm = {
				...currentRoom,
				id: saved.id,
				beds: currentRoom.beds.map((localBed, index) => ({
					...localBed,
					id: saved.beds[index]?.id || localBed.id,
					price: saved.beds[index] ? Number(saved.beds[index].price) : localBed.price,
				})),
				amenities: currentAmenities,
			};

			setInlineRoom(updatedRoom);
			setForm((prev) => ({ ...prev, rooms: [updatedRoom] }));
			onSaveComplete?.();
		};

		if (currentlySaved) updateMutation.mutate(payload, { onSuccess, onError: onSaveFailed });
		else createMutation.mutate(payload, { onSuccess, onError: onSaveFailed });
	}, [triggerSave, isEntirePlace]);

	const handleToggleAmenity = (setter: React.Dispatch<React.SetStateAction<AmenityConfigForm[]>>) => (a: AmenityConfigForm) => {
		setter((prev) => (prev.some((x) => x.amenityId === a.amenityId) ? prev.filter((x) => x.amenityId !== a.amenityId) : [...prev, a]));
	};

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
				<Box>
					<Typography variant="h6" fontWeight={700}>
						Manage Rooms
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Add rooms and their specific features.
					</Typography>
				</Box>
				{rooms.length > 0 && (
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
				)}
			</Box>

			{apiError && (
				<Alert severity="error" sx={{ mb: 2 }}>
					{apiError}
				</Alert>
			)}

			{rooms.length === 0 ? (
				<Paper elevation={0} sx={{ p: 6, textAlign: "center", border: "2px dashed", borderColor: "divider" }}>
					<Typography mb={2}>No rooms added yet</Typography>
					<Button
						variant="outlined"
						startIcon={<AddIcon />}
						onClick={() => {
							setEditingRoom(makeRoom());
							setDraftAmenities([]);
						}}
					>
						Add Your First Room
					</Button>
				</Paper>
			) : (
				<Stack spacing={2}>
					{rooms.map((room) => (
						<RoomCard
							key={room.tempId || room.id}
							room={room}
							onEdit={() => {
								setEditingRoom(room);
								setDraftAmenities(room.amenities);
							}}
							onDelete={() => setForm((p) => ({ ...p, rooms: p.rooms.filter((r) => r.id !== room.id) }))}
						/>
					))}
				</Stack>
			)}

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
						const payload = toRoomDTO(updated, draftAmenities, form);
						const persisted = isRealServerId(updated.id);

						const onSuccess = (saved: RoomSummary) => {
							const savedRoom: RoomForm = {
								...updated,
								id: saved.id,
								amenities: draftAmenities,
								// Đồng bộ ID giường để lần sau nhấn Save sẽ là Update thay vì Create
								beds: updated.beds.map((localBed, index) => ({
									...localBed,
									id: saved.beds[index]?.id || localBed.id,
									price: saved.beds[index] ? Number(saved.beds[index].price) : localBed.price,
								})),
							};
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
