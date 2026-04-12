import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, IconButton, Divider, Box, CircularProgress, Alert } from "@mui/material";
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
	rentalType?: string;
	accommodationType?: string;
	isSaving?: boolean;
	validationError?: string | null;
}

export default function RoomEditModal({ room, open, onClose, onSave, draftAmenities, onAmenityToggle, rentalType, accommodationType, isSaving = false, validationError }: Props) {
	const [draft, setDraft] = useState<RoomForm>({
		...room,
		beds: [...room.beds],
		amenities: [],
	});

	// Thêm state để quản lý lỗi validation tại chỗ
	const [internalError, setInternalError] = useState<string | null>(null);

	const set = (field: keyof RoomForm, value: any) => {
		setInternalError(null);
		setDraft((prev) => {
			// Nếu giá trị không đổi thì không set lại để tránh re-render thừa gây mất focus/nhảy số
			if (prev[field] === value) return prev;
			return { ...prev, [field]: value };
		});
	};

	const addBed = () => setDraft((prev) => ({ ...prev, beds: [...prev.beds, makeBed()] }));
	const removeBed = (id: string) => setDraft((prev) => ({ ...prev, beds: prev.beds.filter((b) => b.id !== id) }));
	const updateBed = (id: string, field: keyof BedForm, value: any) =>
		setDraft((prev) => ({
			...prev,
			beds: prev.beds.map((b) => (b.id === id ? { ...b, [field]: value } : b)),
		}));

	const handleSave = () => {
		const isEntirePlace = rentalType === "ENTIRE_PLACE";
		const finalName = (isEntirePlace ? accommodationType : draft.name)?.trim();

		// --- VALIDATION LOGIC ---
		if (!isEntirePlace && !finalName) {
			setInternalError("Room name cannot be empty.");
			return;
		}

		if (draft.price <= 0) {
			setInternalError("Price must be greater than 0.");
			return;
		}

		if (draft.beds.length === 0) {
			setInternalError("At least one bed is required.");
			return;
		}

		if (isSaving) return;

		// Ép kiểu dữ liệu chuẩn xác trước khi gửi lên API
		const finalPayload: RoomForm = {
			...draft,
			name: finalName || draft.name,
			price: Number(draft.price), // Fix bug price bị trim/string
			beds: draft.beds.map((b) => ({
				...b,
				price: Number(b.price || 0),
				quantity: Number(b.quantity || 1),
			})),
		};

		onSave(finalPayload);
	};

	return (
		<Dialog
			open={open}
			onClose={() => !isSaving && onClose()}
			fullWidth
			maxWidth="md" // 2. GIẢM WIDTH XUỐNG MD
			disableEnforceFocus
			PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
		>
			{/* HEADER */}
			<DialogTitle
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					bgcolor: "primary.main",
					color: "primary.contrastText",
					py: 1.5,
					px: 3,
				}}
			>
				<Typography variant="h6" fontWeight={700} color="inherit">
					{draft.name || "Edit Room"}
				</Typography>
				<IconButton onClick={onClose} size="small" sx={{ color: "primary.contrastText" }} disabled={isSaving}>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			{/* CONTENT */}
			<DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 3, bgcolor: "background.paper" }}>
				<RoomInfoFields draft={draft} set={set} rentalType={rentalType} />
				<Divider />
				<BedList beds={draft.beds} onAdd={addBed} onRemove={removeBed} onUpdate={updateBed} rentalType={rentalType} />
				<Divider />
				<AmenityPicker selected={draftAmenities} onToggle={onAmenityToggle} />
			</DialogContent>

			{/* FOOTER */}
			<DialogActions
				sx={{
					px: 3,
					py: 2,
					bgcolor: "background.paper",
					flexDirection: "column",
					alignItems: "stretch",
					gap: 1,
				}}
			>
				{/* 3. HIỂN THỊ VALIDATION ERROR (Cả BE lẫn FE) */}
				{(validationError || internalError) && (
					<Alert severity="error" sx={{ borderRadius: 2 }}>
						{internalError || validationError}
					</Alert>
				)}

				<Box display="flex" justifyContent="flex-end" gap={1}>
					<Button onClick={onClose} variant="outlined" disabled={isSaving}>
						Cancel
					</Button>
					<Button onClick={handleSave} variant="contained" disabled={isSaving} startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : undefined}>
						{isSaving ? "Saving…" : "Save Room"}
					</Button>
				</Box>
			</DialogActions>
		</Dialog>
	);
}
