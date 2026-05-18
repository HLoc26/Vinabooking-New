import { useState, useEffect, useRef } from "react";
import { Box, Typography, Button, Stack, Alert, Divider, Paper } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import type { RoomForm, AmenityConfigForm, WizardForm, UpdateRoomDTO, RoomSummary, BedForm, ImageItem } from "../../../types/owner.types";
import { makeRoom, makeBed, toEViewType, toEPricingType, toEBedType, toEBedSize } from "../../../const/RoomConst";
import { useCreateRoom, useUpdateRoom } from "../../../hooks/useCreateAndUpdateRoom";
import { useDeleteRoom } from "../../../hooks/useDeleteRoom";
import RoomCard from "./RoomCard";
import RoomEditModal from "./RoomEditModal";
import RoomInfoFields from "./RoomInfoField";
import BedList from "./BedList";
import AmenityPicker from "./AmenityPicker";
import { usePushNotificationContext } from "../../../../../context/PushNotification/hook";
import useModalContext from "../../../../../context/ModalContext/hook";
import { MAX_PRICE, validateRoomForSave } from "./validators";

type Props = Readonly<{
	form: WizardForm;
	setForm: React.Dispatch<React.SetStateAction<WizardForm>>;
	triggerSave?: boolean;
	isManageMode?: boolean;
	renderHeader?: (onAddRoom: () => void) => React.ReactNode;
	onSaveComplete?: () => void;
	onSaveFailed?: () => void;
}>;

// =========================================================================
// PURE HELPER FUNCTIONS
// =========================================================================

const isRealServerId = (id?: string) => !!id && id.length >= 24 && !id.startsWith("local-");

const getInitialRoomState = (rooms: RoomForm[] = []) => (rooms.length > 0 ? rooms[0] : makeRoom());
const getInitialAmenitiesState = (rooms: RoomForm[] = []) => (rooms.length > 0 ? rooms[0].amenities || [] : []);

const removeRoomById = (rooms: RoomForm[], roomId: string) => rooms.filter((r) => r.id !== roomId);
const removeImageByRoomId = (images: ImageItem[], roomId: string) => images.filter((img) => img.roomId !== roomId);
const removeBedById = (beds: BedForm[], bedId: string) => beds.filter((b) => b.id !== bedId);
const addBedToList = (beds: BedForm[]) => [...beds, makeBed()];
const replaceRoomInList = (rooms: RoomForm[], newRoom: RoomForm) => rooms.map((r) => (r.id === newRoom.id ? newRoom : r));
const addRoomToList = (rooms: RoomForm[], newRoom: RoomForm) => [...rooms, newRoom];

const updateBedFieldInList = <K extends keyof BedForm>(beds: BedForm[], bedId: string, field: K, value: BedForm[K]) => {
	return beds.map((b) => (b.id === bedId ? { ...b, [field]: value } : b));
};

const toggleAmenityInList = (list: AmenityConfigForm[], item: AmenityConfigForm) => {
	return list.some((x) => x.id === item.id) ? list.filter((x) => x.id !== item.id) : [...list, item];
};

function buildSavedRoom(updated: RoomForm, saved: RoomSummary, amenities: AmenityConfigForm[]): RoomForm {
	const mappedBeds = updated.beds.map((lb, i) => ({
		...lb,
		id: saved.beds[i]?.id || lb.id,
		price: saved.beds[i] ? Number(saved.beds[i].price) : lb.price,
	}));
	return { ...updated, id: saved.id, amenities, beds: mappedBeds };
}

function toRoomDTO(room: RoomForm, amenities: AmenityConfigForm[], form: WizardForm): UpdateRoomDTO {
	const isEntirePlace = form.rentalType === "ENTIRE_PLACE";
	const rawType = form.accommodationType || "Accommodation";
	const formattedName = rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase();

	const mappedBeds = room.beds.map((b) => ({
		id: isRealServerId(b.id) ? b.id : undefined,
		name: b.name || undefined,
		bedType: toEBedType(b.bedType),
		size: toEBedSize(b.size),
		price: Number(b.price) || 0,
		quantity: b.quantity ?? 1,
	}));

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
		basePrice: Number(room.price) || 0,
		// Default floor = base on create; owner will lower it later from Settings notice / Manage page.
		floorPrice: Number(room.price) || 0,
		pricingType: toEPricingType(room.pricingType),
		isActive: true,
		beds: mappedBeds,
		amenityIds: amenities.map((a) => a.id),
	};
}

// =========================================================================
// COMPONENT 1: ENTIRE PLACE VIEW
// =========================================================================
function EntirePlaceView({ form, setForm, triggerSave, isManageMode, renderHeader, onSaveComplete, onSaveFailed, accommodationId }: Props & Readonly<{ accommodationId: string }>) {
	const { pushNotification } = usePushNotificationContext();
	const [inlineRoom, setInlineRoom] = useState<RoomForm>(() => getInitialRoomState(form.rooms));
	const [inlineAmenities, setInlineAmenities] = useState<AmenityConfigForm[]>(() => getInitialAmenitiesState(form.rooms));
	const [validationError, setValidationError] = useState<string | null>(null);

	const createMutation = useCreateRoom(accommodationId);
	const updateMutation = useUpdateRoom(accommodationId, isRealServerId(inlineRoom.id) ? inlineRoom.id! : "");

	const stateRef = useRef({ inlineRoom, inlineAmenities });
	useEffect(() => {
		stateRef.current = { inlineRoom, inlineAmenities };
	}, [inlineRoom, inlineAmenities]);

	// Cập nhật lại form nếu API đẩy dữ liệu mới về sau khi render lần đầu
	useEffect(() => {
		if (form.rooms.length > 0 && isRealServerId(form.rooms[0].id) && !isRealServerId(inlineRoom.id)) {
			setInlineRoom(form.rooms[0]);
			setInlineAmenities(form.rooms[0].amenities || []);
		}
	}, [form.rooms, inlineRoom.id]);

	useEffect(() => {
		if (!triggerSave) return;

		const { inlineRoom: currentRoom, inlineAmenities: currentAmenities } = stateRef.current;
		const { isValid, errors } = validateRoomForSave(currentRoom, form.rentalType, form.accommodationType);

		if (!isValid) {
			setValidationError(`Validation Error: ${errors.join(", ")}`);
			pushNotification("Please correct the validation errors before proceeding.", "error");
			onSaveFailed?.();
			return;
		}

		setValidationError(null);
		const payload = toRoomDTO(currentRoom, currentAmenities, form);
		const persisted = isRealServerId(currentRoom.id);

		const handleSuccess = (saved: RoomSummary) => {
			const updatedRoom = buildSavedRoom(currentRoom, saved, currentAmenities);
			setInlineRoom(updatedRoom);
			setForm((prev) => ({ ...prev, rooms: [updatedRoom] }));
			onSaveComplete?.();
		};

		const handleError = () => {
			pushNotification("Failed to save room details. Please try again.", "error");
			onSaveFailed?.();
		};

		if (persisted) {
			updateMutation.mutate(payload, { onSuccess: handleSuccess, onError: handleError });
		} else {
			createMutation.mutate(payload, { onSuccess: handleSuccess, onError: handleError });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [triggerSave]);

	const handleUpdateInlineBed = <K extends keyof BedForm>(id: string, field: K, value: BedForm[K]) => {
		setValidationError(null);
		let finalValue = value;
		// Validate price field
		if (field === "price") {
			const numValue = Number(value);
			finalValue = (Number.isNaN(numValue) || numValue < 0 ? undefined : Math.min(MAX_PRICE, numValue)) as BedForm[K];
		}
		if (field === "quantity") {
			const numValue = Number(value);
			finalValue = (Number.isNaN(numValue) || numValue < 1 ? 1 : numValue) as BedForm[K];
		}
		setInlineRoom((p) => ({ ...p, beds: updateBedFieldInList(p.beds, id, field, finalValue) }));
	};

	const handleSetInlineField = <K extends keyof RoomForm>(f: K, v: RoomForm[K]) => {
		setValidationError(null);
		let val = v;
		// Validate price field
		if (f === "price") {
			const numValue = Number(v);
			val = (Number.isNaN(numValue) ? undefined : Math.min(MAX_PRICE, Math.max(0, numValue))) as RoomForm[K];
		}
		setInlineRoom((p) => ({ ...p, [f]: val }));
	};

	const handleAddBed = () => setInlineRoom((p) => ({ ...p, beds: addBedToList(p.beds) }));
	const handleRemoveBed = (id: string) => setInlineRoom((p) => ({ ...p, beds: removeBedById(p.beds, id) }));
	const handleToggleAmenity = (a: AmenityConfigForm) => setInlineAmenities((prev) => toggleAmenityInList(prev, a));

	return (
		<Box>
			{renderHeader?.(() => {})}
			<Box sx={{ px: isManageMode ? 3.5 : 0, py: isManageMode ? 3 : 0 }}>
				{!isManageMode && (
					<Typography variant="h6" fontWeight={700} mb={2}>
						Accommodation Details
					</Typography>
				)}

				{validationError && (
					<Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
						{validationError}
					</Alert>
				)}

				<RoomInfoFields draft={inlineRoom} set={handleSetInlineField} rentalType={form.rentalType} />
				<Divider sx={{ my: 3 }} />
				<BedList beds={inlineRoom.beds} onAdd={handleAddBed} onRemove={handleRemoveBed} onUpdate={handleUpdateInlineBed} rentalType={form.rentalType} />
				<Divider sx={{ my: 3 }} />
				<AmenityPicker selected={inlineAmenities} onToggle={handleToggleAmenity} />
			</Box>
		</Box>
	);
}

// =========================================================================
// COMPONENT 2: MULTI ROOM VIEW
// =========================================================================
function MultiRoomView({ form, setForm, isManageMode, renderHeader, accommodationId }: Props & Readonly<{ accommodationId: string }>) {
	const { pushNotification } = usePushNotificationContext();
	const { openModal, closeModal } = useModalContext();

	const [editingRoom, setEditingRoom] = useState<RoomForm | null>(null);
	const [draftAmenities, setDraftAmenities] = useState<AmenityConfigForm[]>([]);
	const [validationError, setValidationError] = useState<string | null>(null);

	const createMutation = useCreateRoom(accommodationId);
	const deleteMutation = useDeleteRoom(accommodationId);
	const activeId = editingRoom?.id;
	const hasPersisted = isRealServerId(activeId);
	const updateMutation = useUpdateRoom(accommodationId, hasPersisted ? activeId! : "");

	const rooms = form.rooms ?? [];

	const handleExecuteDelete = (roomId: string) => {
		const handleRemoveState = () => {
			setForm((p) => ({ ...p, rooms: removeRoomById(p.rooms, roomId), images: removeImageByRoomId(p.images, roomId) }));
			closeModal();
			pushNotification("Room deleted successfully", "success");
		};

		if (isRealServerId(roomId)) {
			deleteMutation.mutate(roomId, {
				onSuccess: handleRemoveState,
				onError: () => {
					pushNotification("Failed to delete room. Please try again.", "error");
					closeModal();
				},
			});
		} else {
			handleRemoveState();
		}
	};

	const confirmDeleteRoom = (roomId?: string, roomName?: string) => {
		if (!roomId) return;
		openModal(
			<Box sx={{ p: 3, maxWidth: 400 }}>
				<Typography variant="h6" fontWeight={700} mb={1} color="error.main">
					Delete Room?
				</Typography>
				<Typography variant="body2" color="text.secondary" mb={3}>
					Are you sure you want to delete <strong>{roomName || "this room"}</strong>? All associated beds and amenities will be lost.
				</Typography>
				<Box display="flex" justifyContent="flex-end" gap={1.5}>
					<Button variant="text" color="inherit" onClick={closeModal} sx={{ fontWeight: 600 }}>
						Cancel
					</Button>
					<Button variant="contained" color="error" onClick={() => handleExecuteDelete(roomId)} disabled={deleteMutation.isPending} sx={{ fontWeight: 600 }}>
						Delete
					</Button>
				</Box>
			</Box>
		);
	};

	const handleModalSave = (updated: RoomForm) => {
		const { isValid, errors } = validateRoomForSave(updated, form.rentalType, form.accommodationType);
		if (!isValid) {
			setValidationError(`Error: ${errors.join(", ")}`);
			return;
		}

		const payload = toRoomDTO(updated, draftAmenities, form);
		const persisted = isRealServerId(updated.id);

		const handleSuccess = (saved: RoomSummary) => {
			const savedRoom = buildSavedRoom(updated, saved, draftAmenities);
			if (persisted) {
				setForm((prev) => ({ ...prev, rooms: replaceRoomInList(prev.rooms, savedRoom) }));
			} else {
				setForm((prev) => ({ ...prev, rooms: addRoomToList(prev.rooms, savedRoom) }));
			}
			setEditingRoom(null);
			setValidationError(null);
		};
		const handleError = () => pushNotification("Failed to save room details.", "error");

		if (persisted) {
			updateMutation.mutate(payload, { onSuccess: handleSuccess, onError: handleError });
		} else {
			createMutation.mutate(payload, { onSuccess: handleSuccess, onError: handleError });
		}
	};

	const handleOpenAddRoom = () => {
		setEditingRoom(makeRoom());
		setDraftAmenities([]);
	};
	const handleEditRoomClick = (room: RoomForm) => {
		setEditingRoom(room);
		setDraftAmenities(room.amenities || []);
	};
	const handleToggleDraftAmenity = (a: AmenityConfigForm) => setDraftAmenities((prev) => toggleAmenityInList(prev, a));
	const handleCloseModal = () => {
		setEditingRoom(null);
		setValidationError(null);
	};

	return (
		<Box>
			{renderHeader
				? renderHeader(handleOpenAddRoom)
				: !isManageMode && (
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
								<Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddRoom}>
									Add Room
								</Button>
							)}
						</Box>
					)}

			<Box sx={{ px: isManageMode ? 3.5 : 0, py: isManageMode ? 3 : 0 }}>
				{validationError && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{validationError}
					</Alert>
				)}

				{rooms.length === 0 ? (
					<Paper elevation={0} sx={{ p: 6, textAlign: "center", border: "2px dashed", borderColor: "divider", bgcolor: "transparent" }}>
						<Typography color="text.secondary" mb={2}>
							No rooms added yet
						</Typography>
						<Button variant="outlined" startIcon={<AddIcon />} onClick={handleOpenAddRoom} sx={{ borderRadius: "10px", fontWeight: 600 }}>
							Add Your First Room
						</Button>
					</Paper>
				) : (
					<Stack spacing={2}>
						{rooms.map((room) => (
							<RoomCard key={room.tempId || room.id} room={room} onEdit={() => handleEditRoomClick(room)} onDelete={() => confirmDeleteRoom(room.id, room.name)} />
						))}
					</Stack>
				)}
			</Box>

			{editingRoom && (
				<RoomEditModal
					open
					room={editingRoom}
					draftAmenities={draftAmenities}
					onAmenityToggle={handleToggleDraftAmenity}
					rentalType={form.rentalType}
					accommodationType={form.accommodationType}
					isSaving={createMutation.isPending || updateMutation.isPending}
					onClose={handleCloseModal}
					onSave={handleModalSave}
				/>
			)}
		</Box>
	);
}

// =========================================================================
// ROOT COMPONENT (DECIDER)
// =========================================================================
export default function StepRoomsBox(props: Props) {
	const isEntirePlace = props.form.rentalType === "ENTIRE_PLACE";
	const accommodationId = props.form.accommodationId ?? "";

	if (isEntirePlace) {
		return <EntirePlaceView {...props} accommodationId={accommodationId} />;
	}
	return <MultiRoomView {...props} accommodationId={accommodationId} />;
}
