import { useState } from "react";
import { Box, TextField, MenuItem, Typography, InputAdornment, alpha } from "@mui/material";
import type { RoomForm } from "../../../types/owner.types";
import { VIEW_TYPES, PRICING_TYPES } from "../../../const/RoomConst";
import AccommodationInfoField from "./AccommodationInfoField";

interface Props {
	draft: RoomForm;
	set: (field: keyof RoomForm, value: any) => void;
	rentalType?: string;
}

// ─── STEPPER FIELD (Dùng cho các chỉ số nhỏ như Adults, Bedrooms...) ───────────
export function StepperField({
	label,
	value,
	onChange,
	allowDecimal = false,
	min = 0,
	max,
	stepAmount = 1,
}: {
	label: string;
	value: number | undefined;
	onChange: (v: number) => void;
	allowDecimal?: boolean;
	min?: number;
	max?: number;
	stepAmount?: number;
}) {
	const [raw, setRaw] = useState<string>(String(value ?? 0));
	const [focused, setFocused] = useState(false);
	const current = value ?? 0;

	if (!focused && raw !== String(value ?? 0)) setRaw(String(value ?? 0));

	const clamp = (n: number) => {
		let v = Math.max(min, n);
		if (max !== undefined) v = Math.min(max, v);
		return v;
	};

	const step = (delta: number) => {
		const next = clamp(current + delta * stepAmount);
		onChange(next);
		setRaw(String(next));
	};

	const btnSx = {
		width: 28,
		height: 28,
		borderRadius: "50%",
		border: "1.2px solid",
		borderColor: "divider",
		bgcolor: "transparent",
		cursor: "pointer",
		fontSize: 16,
		fontWeight: 700,
		color: "text.secondary",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
		"&:hover": { bgcolor: "action.hover", borderColor: "primary.main", color: "primary.main" },
		transition: "all 0.1s",
	};

	return (
		<Box display="flex" alignItems="center" gap={1.2}>
			<Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ fontSize: 13, whiteSpace: "nowrap", minWidth: 70, flexShrink: 0 }}>
				{label}:
			</Typography>
			<Box display="flex" alignItems="center" gap={0.5}>
				{" "}
				<Box component="button" type="button" onClick={() => step(-1)} sx={btnSx}>
					−
				</Box>
				<Box
					component="input"
					value={raw}
					onChange={(e) => {
						const v = e.target.value;
						if (allowDecimal ? /^\d*\.?\d*$/.test(v) : /^\d*$/.test(v)) setRaw(v);
					}}
					onFocus={() => {
						setFocused(true);
						setRaw(String(current));
					}}
					onBlur={(e) => {
						setFocused(false);
						const parsed = parseFloat(e.target.value);
						if (!isNaN(parsed)) {
							const clamped = clamp(parsed);
							onChange(clamped);
							setRaw(String(clamped));
						} else setRaw(String(current));
					}}
					sx={{
						width: 42,
						height: 30,
						border: "1px solid",
						borderColor: "divider",
						borderRadius: 1.5,
						textAlign: "center",
						fontSize: 13,
						fontWeight: 700,
						outline: "none",
						color: "text.primary",
						bgcolor: "rgba(255, 255, 255, 0.05)",
						"&:focus": { borderColor: "primary.main" },
					}}
				/>
				<Box component="button" type="button" onClick={() => step(1)} sx={btnSx}>
					+
				</Box>
			</Box>
		</Box>
	);
}

// ─── COMMON FIELDS (Xử lý Price định dạng 1.000 và nút tăng giảm) ──────────────
export function CommonFields({ draft, set, viewDisabled }: { draft: RoomForm; set: any; viewDisabled: boolean }) {
	return (
		<Box display="flex" flexDirection="column" gap={4}>
			{" "}
			{/* Tăng khoảng cách giữa các hàng info */}
			{/* Hàng View: Để 1fr 2fr để Description rộng hơn, nhìn đỡ bị chụm */}
			<Box display="grid" gridTemplateColumns="1.2fr 1.8fr" gap={3}>
				<TextField select label="View Type" value={draft.viewType} onChange={(e) => set("viewType", e.target.value)}>
					{VIEW_TYPES.map((t) => (
						<MenuItem key={t} value={t}>
							{t.replace(/_/g, " ")}
						</MenuItem>
					))}
				</TextField>
				<TextField label="View Description" multiline rows={1} value={draft.viewDescription ?? ""} onChange={(e) => set("viewDescription", e.target.value)} disabled={viewDisabled} />
			</Box>
			{/* Hàng Price: Giữ 1fr 1fr nhưng tăng gap */}
			<Box display="grid" gridTemplateColumns="1fr 1fr" gap={3}>
				<TextField
					label="Price"
					value={new Intl.NumberFormat("vi-VN").format(draft.price || 0)}
					onChange={(e) => {
						const raw = e.target.value.replace(/\./g, "");
						set("price", parseInt(raw, 10) || 0);
					}}
					InputLabelProps={{ shrink: true }}
					InputProps={{
						endAdornment: (
							<InputAdornment position="end">
								<Typography variant="caption" fontWeight={700}>
									VND
								</Typography>
							</InputAdornment>
						),
					}}
				/>
				<TextField select label="Pricing Type" value={draft.pricingType} onChange={(e) => set("pricingType", e.target.value)}>
					{PRICING_TYPES.map((t) => (
						<MenuItem key={t} value={t}>
							{t.replace(/_/g, " ")}
						</MenuItem>
					))}
				</TextField>
			</Box>
			{/* Description: Cho xuống dưới cùng một mình một hàng */}
			<TextField
				fullWidth
				label="Description"
				multiline
				minRows={3}
				value={draft.description || ""}
				onChange={(e) => set("description", e.target.value.slice(0, 150))}
				helperText={`${(draft.description || "").length}/150`}
			/>
		</Box>
	);
}
// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function RoomInfoFields({ draft, set, rentalType }: Props) {
	if (rentalType === "ENTIRE_PLACE") return <AccommodationInfoField draft={draft} set={set} />;

	const isShared = rentalType === "SHARED_ROOM";
	const viewDisabled = draft.viewType === "NONE";

	return (
		<Box>
			<Typography variant="subtitle2" fontWeight={800} color="text.secondary" mb={2.5} sx={{ textTransform: "uppercase", letterSpacing: 1.5 }}>
				Room Info
			</Typography>

			<Box display="flex" flexDirection="column" gap={4}>
				{/* Trường nhập tên */}
				<TextField fullWidth required label="Room Name" value={draft.name} onChange={(e) => set("name", e.target.value.slice(0, 50))} />

				{/* Hàng Stepper 1: Quantity - Adults - Children */}
				<Box display="grid" gridTemplateColumns="1fr 1fr 1fr" alignItems="center">
					<Box display="flex" justifyContent="flex-start">
						<StepperField label="Quantity" value={draft.quantity} onChange={(v) => set("quantity", v)} min={1} />
					</Box>
					<Box display="flex" justifyContent="center">
						<StepperField label="Adults" value={draft.maxAdults} onChange={(v) => set("maxAdults", v)} min={1} />
					</Box>
					<Box display="flex" justifyContent="flex-end">
						<StepperField label="Children" value={draft.maxChildren} onChange={(v) => set("maxChildren", v)} min={0} />
					</Box>
				</Box>

				{/* Hàng Stepper 2: Xử lý linh hoạt Bedrooms/Baths/Size */}
				<Box display="grid" gridTemplateColumns="1fr 1fr 1fr" alignItems="center">
					{!isShared ? (
						<>
							{/* Case PRIVATE: Bedrooms - Baths - Size */}
							<Box display="flex" justifyContent="flex-start">
								<StepperField label="Bedrooms" value={draft.bedroomCount} onChange={(v) => set("bedroomCount", v)} />
							</Box>
							<Box display="flex" justifyContent="center">
								<StepperField label="Baths" value={draft.bathroomCount} onChange={(v) => set("bathroomCount", v)} />
							</Box>
							<Box display="flex" justifyContent="flex-end">
								<StepperField label="Size (m²)" value={draft.size ?? 0} onChange={(v) => set("size", v || undefined)} allowDecimal />
							</Box>
						</>
					) : (
						<>
							{/* Case SHARED: Baths - Size - Mock */}
							<Box display="flex" justifyContent="flex-start">
								<StepperField label="Baths" value={draft.bathroomCount} onChange={(v) => set("bathroomCount", v)} />
							</Box>
							<Box display="flex" justifyContent="center">
								<StepperField label="Size (m²)" value={draft.size ?? 0} onChange={(v) => set("size", v || undefined)} allowDecimal />
							</Box>
							<Box display="flex" justifyContent="flex-end">
								{/* Ô Mock trống để giữ cấu trúc 3 cột cho thẳng hàng trên */}
							</Box>
						</>
					)}
				</Box>

				{/* PHẢI CÓ DÒNG NÀY: Gọi các trường View, Price, Description */}
				<CommonFields draft={draft} set={set} viewDisabled={viewDisabled} />
			</Box>
		</Box>
	);
}
