import { useState, useEffect, useRef } from "react";
import { Box, Typography, Button, Stack, Alert, Divider, Paper } from "@mui/material";
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

function toCreateRoomDTO(room: RoomForm, amenities: AmenityConfigForm[], form: WizardForm): CreateRoomDTO {
	const isEntirePlace = form.rentalType === "ENTIRE_PLACE";

	// Format lại tên: VILLA -> Villa
	const rawType = form.accommodationType || "Accommodation";
	const formattedName = rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase();

	return {
		name: isEntirePlace ? formattedName : room.name,
		description: room.description || undefined,
		quantity: room.quantity || 1,
		maxAdults: room.maxAdults || 1,
		maxChildren: room.maxChildren || 0,
		size: room.size,
		bedroomCount: room.bedroomCount || 0,
		bathroomCount: room.bathroomCount || 0,
		viewType: toEViewType(room.viewType),
		viewDescription: room.viewDescription || undefined,
		price: Number(room.price) || 0,
		pricingType: toEPricingType(room.pricingType),
		isActive: true,
		beds: room.beds.map((b) => ({
			name: b.name || undefined,
			bedType: toEBedType(b.bedType) as any,
			size: toEBedSize(b.size),
			price: Number(b.price) || 0,
			quantity: b.quantity ?? 1,
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
		// 1.  Entire Place and only after trigger
		if (!isEntirePlace || !triggerSave) return;

		const { inlineRoom: currentRoom, inlineAmenities: currentAmenities } = stateRef.current;

		// 2. Validate data before calling API
		// Nếu LÀ Entire Place -> Bỏ qua check tên (vì đã lấy từ accommodationType).
		// Nếu KHÔNG PHẢI Entire Place -> Phải check currentRoom.name
		if (!isEntirePlace && !currentRoom.name?.trim()) {
			onSaveFailed?.();
			return;
		}

		const payload = toCreateRoomDTO(currentRoom, currentAmenities, form);
		const currentlySaved = isRealServerId(currentRoom.id);

		// 3. Xử lý khi thành công
		const onSuccess = (saved: RoomSummary) => {
			const updatedRoom: RoomForm = {
				...currentRoom,
				id: saved.id,
				amenities: currentAmenities,
			};
			setInlineRoom(updatedRoom);
			setForm((prev) => ({ ...prev, rooms: [updatedRoom] }));

			// Quan trọng: Gọi hàm này để cha chuyển sang Step 4
			onSaveComplete?.();
		};

		// 4. Xử lý khi lỗi API
		const onError = () => {
			onSaveFailed?.(); // Reset trigger để có thể bấm Next lại lần sau
		};

		if (currentlySaved) {
			updateMutation.mutate(payload, { onSuccess, onError });
		} else {
			createMutation.mutate(payload, { onSuccess, onError });
		}
	}, [triggerSave, isEntirePlace]); // Giữ nguyên deps

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

	// ── RENDER FOR SHARED/PRIVATE ROOMS ──
	return (
		<Box>
			<Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
				<Box>
					<Typography variant="h6" fontWeight={700} mb={0.5}>
						Manage Rooms
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Add the rooms available in your property. Each room can have its own beds and amenities.
					</Typography>
				</Box>
				{/* Only show top button if there are already rooms */}
				{rooms.length > 0 && (
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={() => {
							setEditingRoom(makeRoom());
							setDraftAmenities([]);
						}}
						sx={{ borderRadius: 2, fontWeight: 700, whiteSpace: "nowrap", ml: 2 }}
					>
						Add Room
					</Button>
				)}
			</Box>

			{apiError && (
				<Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
					{apiError}
				</Alert>
			)}

			{/* ── Room List or Empty State ────────────────────────────────────────── */}
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
						backgroundColor: "background.paper",
					}}
				>
					{/* You can use KingBedOutlinedIcon here if imported */}
					<Typography color="text.primary" variant="body1">
						No rooms added yet
					</Typography>
					<Button
						variant="outlined"
						startIcon={<AddIcon />}
						onClick={() => {
							setEditingRoom(makeRoom());
							setDraftAmenities([]);
						}}
						sx={{ borderRadius: 2 }}
					>
						Add Your First Room
					</Button>
				</Paper>
			) : (
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
						const payload = toCreateRoomDTO(updated, draftAmenities, form);
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
