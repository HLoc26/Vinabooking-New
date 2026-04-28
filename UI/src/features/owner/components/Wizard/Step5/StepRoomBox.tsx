import { useState, useEffect, useRef } from "react";
import { Box, Typography, Button, Stack, Alert, Divider, Paper } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import type { RoomForm, AmenityConfigForm, WizardForm, UpdateRoomDTO, RoomSummary, BedForm } from "../../../types/owner.types";
import { makeRoom, makeBed, toEViewType, toEPricingType, toEBedType, toEBedSize } from "../../../const/RoomConst";
import { useCreateRoom, useUpdateRoom } from "../../../hooks/useCreateAndUpdateRoom";
import { useDeleteRoom } from "../../../hooks/useDeleteRoom";
import RoomCard from "./RoomCard";
import RoomEditModal from "./RoomEditModal";
import RoomInfoFields from "./RoomInfoField";
import BedList from "./BedList";
import AmenityPicker from "./AmenityPicker";
import { usePushNotificationContext } from "../../../../../context/PushNotification/hook";
import { MAX_PRICE, validateRoomForSave } from "./validators";

interface Props {
	form: WizardForm;
	setForm: React.Dispatch<React.SetStateAction<WizardForm>>;
	triggerSave?: boolean;
	onSaveComplete?: () => void;
	onSaveFailed?: () => void;
}

// HELPERS

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
			bedType: toEBedType(b.bedType),
			size: toEBedSize(b.size),
			price: Number(b.price) || 0,
			quantity: b.quantity ?? 1,
		})),
		amenityIds: amenities.map((a) => a.id),
	};
}

const isRealServerId = (id?: string) => !!id && id.length > 25 && !id.startsWith("local-");

// COMPONENT

export default function StepRoomsBox({ form, setForm, triggerSave, onSaveComplete, onSaveFailed }: Props) {
	const accommodationId = form.accommodationId ?? "";
	const isEntirePlace = form.rentalType === "ENTIRE_PLACE";
	const rooms = form.rooms ?? [];

	const { pushNotification } = usePushNotificationContext();

	const [inlineRoom, setInlineRoom] = useState<RoomForm>(() => (rooms.length > 0 ? rooms[0] : makeRoom()));
	const [inlineAmenities, setInlineAmenities] = useState<AmenityConfigForm[]>(rooms.length > 0 ? rooms[0].amenities || [] : []);
	const [validationError, setValidationError] = useState<string | null>(null);

	const [editingRoom, setEditingRoom] = useState<RoomForm | null>(null);
	const [draftAmenities, setDraftAmenities] = useState<AmenityConfigForm[]>([]);

	const createMutation = useCreateRoom(accommodationId);
	const deleteMutation = useDeleteRoom(accommodationId);

	const activeId = isEntirePlace ? inlineRoom.id : editingRoom?.id;
	const hasPersisted = isRealServerId(activeId);
	const updateMutation = useUpdateRoom(accommodationId, hasPersisted ? activeId! : "");

	const stateRef = useRef({ inlineRoom, inlineAmenities });
	useEffect(() => {
		stateRef.current = { inlineRoom, inlineAmenities };
	}, [inlineRoom, inlineAmenities]);

	const handleDeleteRoom = (roomId?: string) => {
		if (!roomId) return;

		const removeLocal = () => {
			setForm((p) => ({
				...p,
				rooms: p.rooms.filter((r) => r.id !== roomId),
				// Also remove associated images from local state
				images: p.images.filter((img) => img.roomId !== roomId),
			}));
		};

		if (isRealServerId(roomId)) {
			deleteMutation.mutate(roomId, {
				onSuccess: removeLocal,
				onError: () => {
					pushNotification("Failed to delete room. Please try again.", "error");
				},
			});
		} else {
			removeLocal();
		}
	};

	// AUTO-SAVE EFFECT (ENTIRE PLACE)
	useEffect(() => {
		if (!isEntirePlace || !triggerSave) return;

		const { inlineRoom: currentRoom, inlineAmenities: currentAmenities } = stateRef.current;

		// Validation logic
		const { isValid, errors } = validateRoomForSave(currentRoom, form.rentalType, form.accommodationType);

		if (!isValid) {
			setValidationError(`Validation Error: ${errors.join(", ")}`);
			pushNotification("Please correct the validation errors before proceeding.", "error");
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

		const onError = () => {
			pushNotification("Failed to save room details. Please try again.", "error");
			onSaveFailed?.();
		};

		if (currentlySaved) updateMutation.mutate(payload, { onSuccess, onError });
		else createMutation.mutate(payload, { onSuccess, onError });
	}, [triggerSave, isEntirePlace]);

	// HANDLERS

	const handleUpdateInlineBed = <K extends keyof BedForm>(id: string, field: K, value: BedForm[K]) => {
		setValidationError(null);
		let finalValue = value as BedForm[K];

		// Validate price field
		if (field === "price") {
			const numValue = Number(value);
			if (isNaN(numValue) || numValue < 0) {
				finalValue = undefined as BedForm[K];
			} else {
				finalValue = Math.min(MAX_PRICE, numValue) as BedForm[K];
			}
		}

		// Validate quantity field
		if (field === "quantity") {
			const numValue = Number(value);
			finalValue = (isNaN(numValue) || numValue < 1 ? 1 : numValue) as BedForm[K];
		}

		setInlineRoom((p) => ({
			...p,
			beds: p.beds.map((b) => (b.id === id ? { ...b, [field]: finalValue } : b)),
		}));
	};

	const handleSetInlineField = <K extends keyof RoomForm>(f: K, v: RoomForm[K]) => {
		setValidationError(null);
		let val = v as RoomForm[K];

		// Validate price field
		if (f === "price") {
			const numValue = Number(v);
			if (isNaN(numValue)) {
				val = undefined as RoomForm[K]; // let validation catch it
			} else {
				val = Math.min(MAX_PRICE, Math.max(0, numValue)) as RoomForm[K];
			}
		}

		setInlineRoom((p) => ({ ...p, [f]: val }));
	};

	// ─ Inline validation for displaying errors in real-time
	const inlineValidation = validateRoomForSave(inlineRoom, form.rentalType, form.accommodationType);
	const canSaveInline = inlineValidation.isValid;

	if (isEntirePlace) {
		return (
			<Box>
				<Typography variant="h6" fontWeight={700} mb={2}>
					{isEntirePlace ? "Accommodation Details" : "Room Details"}
				</Typography>
				{(validationError || !canSaveInline) && (
					<Alert severity={validationError ? "error" : "warning"} sx={{ mb: 2, borderRadius: 2 }}>
						{validationError || `Please fix: ${inlineValidation.errors.join(", ")}`}
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
				<AmenityPicker selected={inlineAmenities} onToggle={(a) => setInlineAmenities((prev) => (prev.some((x) => x.id === a.id) ? prev.filter((x) => x.id !== a.id) : [...prev, a]))} />
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
					<Typography variant="body2" color="text.secondary" mt={0.5}>
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

			{validationError && (
				<Alert severity="error" sx={{ mb: 2 }}>
					{validationError}
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
							onDelete={() => handleDeleteRoom(room.id)}
						/>
					))}
				</Stack>
			)}

			{editingRoom && (
				<RoomEditModal
					open
					room={editingRoom}
					draftAmenities={draftAmenities}
					onAmenityToggle={(a) => setDraftAmenities((prev) => (prev.some((x) => x.id === a.id) ? prev.filter((x) => x.id !== a.id) : [...prev, a]))}
					rentalType={form.rentalType}
					accommodationType={form.accommodationType}
					isSaving={createMutation.isPending || updateMutation.isPending}
					onClose={() => {
						setEditingRoom(null);
						setValidationError(null);
					}}
					onSave={(updated) => {
						// Modal validation
						const { isValid, errors } = validateRoomForSave(updated, form.rentalType, form.accommodationType);

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

						const onError = () => {
							pushNotification("Failed to save room details. Please try again.", "error");
						};

						if (persisted) updateMutation.mutate(payload, { onSuccess, onError });
						else createMutation.mutate(payload, { onSuccess, onError });
					}}
				/>
			)}
		</Box>
	);
}
