import { useState, useEffect, useRef } from "react";
import { Box, Typography, Button, Stack, Alert, Divider, Paper } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import type { RoomForm, AmenityConfigForm, WizardForm, UpdateRoomDTO, RoomSummary, BedForm } from "../../../types/owner.types";
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

const MAX_PRICE = 100000000; // 100 Million VND

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

// ─── VALIDATION HELPERS ──────────────────────────────────────────────────────

const validateRoomForSave = (room: RoomForm, form: WizardForm): { isValid: boolean; errors: string[] } => {
	const isEntirePlace = form.rentalType === "ENTIRE_PLACE";
	const nameToCheck = (isEntirePlace ? form.accommodationType : room.name)?.trim();
	const priceToCheck = Number(room.price);

	const errors: string[] = [];

	// Basic validation
	if (!nameToCheck) errors.push("room name");
	if (!isEntirePlace && priceToCheck <= 0) errors.push("valid price");
	if (priceToCheck > MAX_PRICE) errors.push("room price exceeds 100M VND");

	if (room.maxAdults < 1) errors.push("guest capacity (min 1)");

	// Bed validation
	if (!room.beds?.length) {
		errors.push("at least one bed");
	} else {
		room.beds.forEach((bed, i) => {
			if (!bed.name?.trim()) errors.push(`bed #${i + 1} name`);
			if (!bed.bedType) errors.push(`bed #${i + 1} type`);
			const qty = bed.quantity ?? 1;
			if (!qty || qty < 1) errors.push(`bed #${i + 1} quantity (min 1)`);
			const bedPrice = Number(bed.price || 0);
			if (bedPrice > MAX_PRICE) errors.push(`bed #${i + 1} price exceeds 100M VND`);
		});
	}

	return { isValid: errors.length === 0, errors };
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function StepRoomsBox({ form, setForm, triggerSave, onSaveComplete, onSaveFailed }: Props) {
	const accommodationId = form.accommodationId ?? "";
	const isEntirePlace = form.rentalType === "ENTIRE_PLACE";
	const rooms = form.rooms ?? [];

	const [inlineRoom, setInlineRoom] = useState<RoomForm>(() => (rooms.length > 0 ? rooms[0] : makeRoom()));
	const [inlineAmenities, setInlineAmenities] = useState<AmenityConfigForm[]>(rooms.length > 0 ? rooms[0].amenities || [] : []);
	const [validationError, setValidationError] = useState<string | null>(null);

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

		// Validation logic
		const { isValid, errors } = validateRoomForSave(currentRoom, form);

		if (!isValid) {
			console.error("[StepRoomsBox Validation Failed]:", errors);
			setValidationError(`Validation Error: ${errors.join(", ")}`);
			onSaveFailed?.();
			return;
		}

		setValidationError(null);
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

		const onError = (err: any) => {
			console.error("[StepRoomsBox API Error]:", err);
			onSaveFailed?.();
		};

		if (currentlySaved) updateMutation.mutate(payload, { onSuccess, onError });
		else createMutation.mutate(payload, { onSuccess, onError });
	}, [triggerSave, isEntirePlace]);

	// ── HANDLERS ────────────────────────────────────────────────────────────────

	const handleUpdateInlineBed = (id: string, field: keyof BedForm, value: any) => {
		setValidationError(null);
		let finalValue = value;

		// Validate price field
		if (field === "price") {
			const numValue = Number(value);
			if (isNaN(numValue) || numValue < 0) {
				finalValue = undefined;
			} else {
				finalValue = Math.min(MAX_PRICE, numValue);
			}
		}

		// Validate quantity field
		if (field === "quantity") {
			const numValue = Number(value);
			finalValue = isNaN(numValue) || numValue < 1 ? 1 : numValue;
		}

		setInlineRoom((p) => ({
			...p,
			beds: p.beds.map((b) => (b.id === id ? { ...b, [field]: finalValue } : b)),
		}));
	};

	const handleSetInlineField = (f: keyof RoomForm, v: any) => {
		setValidationError(null);
		let val = v;

		// Validate price field
		if (f === "price") {
			const numValue = Number(v);
			val = isNaN(numValue) ? 0 : Math.min(MAX_PRICE, Math.max(0, numValue));
		}

		setInlineRoom((p) => ({ ...p, [f]: val }));
	};

	// ─ Inline validation for displaying errors in real-time
	const inlineValidation = validateRoomForSave(inlineRoom, form);
	const canSaveInline = inlineValidation.isValid;

	if (isEntirePlace) {
		return (
			<Box>
				<Typography variant="h6" fontWeight={700} mb={2}>
					{isEntirePlace ? "Accommodation Details" : "Room Details"}
				</Typography>
				{(validationError || apiError || !canSaveInline) && (
					<Alert severity={validationError || apiError ? "error" : "warning"} sx={{ mb: 2, borderRadius: 2 }}>
						{validationError || apiError || `Please fix: ${inlineValidation.errors.join(", ")}`}
					</Alert>
				)}
				<RoomInfoFields draft={inlineRoom} set={handleSetInlineField} rentalType={form.rentalType} />
				<Divider sx={{ my: 3 }} />
				<BedList
					beds={inlineRoom.beds}
					onAdd={() => setInlineRoom((p) => ({ ...p, beds: [...p.beds, makeBed()] }))}
					onRemove={(id) => setInlineRoom((p) => ({ ...p, beds: p.beds.filter((b) => b.id !== id) }))}
					onUpdate={handleUpdateInlineBed}
					rentalType={form.rentalType}
				/>
				<Divider sx={{ my: 3 }} />
				<AmenityPicker
					selected={inlineAmenities}
					onToggle={(a) => setInlineAmenities((prev) => (prev.some((x) => x.amenityId === a.amenityId) ? prev.filter((x) => x.amenityId !== a.amenityId) : [...prev, a]))}
				/>
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

			{(validationError || apiError) && (
				<Alert severity="error" sx={{ mb: 2 }}>
					{validationError || apiError}
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
								setDraftAmenities(room.amenities || []);
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
					onAmenityToggle={(a) => setDraftAmenities((prev) => (prev.some((x) => x.amenityId === a.amenityId) ? prev.filter((x) => x.amenityId !== a.amenityId) : [...prev, a]))}
					rentalType={form.rentalType}
					isSaving={createMutation.isPending || updateMutation.isPending}
					onClose={() => {
						setEditingRoom(null);
						setValidationError(null);
					}}
					onSave={(updated) => {
						// Modal validation
						const { isValid, errors } = validateRoomForSave(updated, form);

						if (!isValid) {
							console.error("[Modal Save Validation Failed]:", errors);
							setValidationError(`Error: ${errors.join(", ")}`);
							return;
						}

						const payload = toRoomDTO(updated, draftAmenities, form);
						const persisted = isRealServerId(updated.id);

						const onSuccess = (saved: RoomSummary) => {
							const savedRoom: RoomForm = {
								...updated,
								id: saved.id,
								amenities: draftAmenities,
								beds: updated.beds.map((lb, i) => ({
									...lb,
									id: saved.beds[i]?.id || lb.id,
									price: saved.beds[i] ? Number(saved.beds[i].price) : lb.price,
								})),
							};
							setForm((prev) => ({
								...prev,
								rooms: persisted ? prev.rooms.map((r) => (r.id === updated.id ? savedRoom : r)) : [...prev.rooms, savedRoom],
							}));
							setEditingRoom(null);
							setValidationError(null);
						};

						const onError = (err: any) => console.error("[Modal API Error]:", err);

						if (persisted) updateMutation.mutate(payload, { onSuccess, onError });
						else createMutation.mutate(payload, { onSuccess, onError });
					}}
				/>
			)}
		</Box>
	);
}
