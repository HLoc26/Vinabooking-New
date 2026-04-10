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
			<Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ fontSize: 13, whiteSpace: "nowrap", flexShrink: 0 }}>
				{label}:
			</Typography>
			<Box display="flex" alignItems="center" gap={0.5}>
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
	// Format hiển thị: 1000 -> 1.000
	const formatNumber = (val: number) => {
		return new Intl.NumberFormat("vi-VN").format(val || 0);
	};
	// Xử lý khi gõ: Xóa dấu chấm để lưu số nguyên vào state
	const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value.replace(/\./g, "");
		const num = parseInt(raw, 10);
		set("price", isNaN(num) ? 0 : num);
	};

	const stepPrice = (delta: number) => {
		const next = Math.max(0, (draft.price || 0) + delta);
		set("price", next);
	};

	return (
		<>
			<Box display="grid" gridTemplateColumns="1fr 1fr" gap={4}>
				<TextField
					fullWidth
					select
					label="View Type"
					value={draft.viewType}
					onChange={(e) => {
						set("viewType", e.target.value);
						if (e.target.value === "NONE") set("viewDescription", "");
					}}
				>
					{VIEW_TYPES.map((t) => (
						<MenuItem key={t} value={t}>
							{t.replace(/_/g, " ")}
						</MenuItem>
					))}
				</TextField>
				<TextField
					fullWidth
					label="View Description"
					multiline
					rows={2}
					value={draft.viewDescription ?? ""}
					onChange={(e) => set("viewDescription", e.target.value)}
					disabled={viewDisabled}
					sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05), borderRadius: 1 }}
				/>
			</Box>

			<Box display="grid" gridTemplateColumns="1fr 1fr" gap={4}>
				<TextField
					fullWidth
					label="Price"
					value={formatNumber(draft.price || 0)}
					onChange={handlePriceChange}
					// Quan trọng: Luôn giữ Label ở trên để không bị số đè lên
					InputLabelProps={{ shrink: true }}
					InputProps={{
						endAdornment: (
							<InputAdornment position="end" sx={{ gap: 1 }}>
								<Typography variant="caption" fontWeight={700} color="text.disabled">
									VND
								</Typography>
								<Box display="flex" flexDirection="column" sx={{ borderLeft: "1px solid", borderColor: "divider", pl: 0.5, ml: 0.5 }}>
									<Box
										component="button"
										type="button"
										onClick={() => stepPrice(1000)}
										sx={{
											border: "none",
											background: "none",
											cursor: "pointer",
											p: 0,
											lineHeight: 1,
											fontSize: "10px",
											"&:hover": { color: "primary.main" },
											color: "text.secondary",
										}}
									>
										▲
									</Box>
									<Box
										component="button"
										type="button"
										onClick={() => stepPrice(-1000)}
										sx={{
											border: "none",
											background: "none",
											cursor: "pointer",
											p: 0,
											lineHeight: 1,
											fontSize: "10px",
											"&:hover": { color: "primary.main" },
											color: "text.secondary",
										}}
									>
										▼
									</Box>
								</Box>
							</InputAdornment>
						),
					}}
				/>

				<TextField fullWidth select label="Pricing Type" value={draft.pricingType} onChange={(e) => set("pricingType", e.target.value)}>
					{PRICING_TYPES.map((t) => (
						<MenuItem key={t} value={t}>
							{t.replace(/_/g, " ")}
						</MenuItem>
					))}
				</TextField>
			</Box>

			<TextField
				fullWidth
				label="Description"
				multiline
				minRows={3}
				value={draft.description || ""}
				onChange={(e) => set("description", e.target.value.slice(0, 150))}
				helperText={`${(draft.description || "").length}/150`}
				FormHelperTextProps={{ sx: { textAlign: "right" } }}
			/>
		</>
	);
}

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
				<TextField fullWidth required label="Room Name" value={draft.name} onChange={(e) => set("name", e.target.value.slice(0, 50))} />

				<Box display="grid" gridTemplateColumns="repeat(3, auto)" justifyContent="start" gap={10}>
					<StepperField label="Quantity" value={draft.quantity} onChange={(v) => set("quantity", v)} min={1} />
					<StepperField label="Adults" value={draft.maxAdults} onChange={(v) => set("maxAdults", v)} min={1} />
					<StepperField label="Children" value={draft.maxChildren} onChange={(v) => set("maxChildren", v)} min={0} />
				</Box>

				<Box display="grid" gridTemplateColumns="repeat(3, auto)" justifyContent="start" gap={10}>
					{!isShared ? <StepperField label="Bedrooms" value={draft.bedroomCount} onChange={(v) => set("bedroomCount", v)} /> : <Box />}
					<StepperField label="Baths" value={draft.bathroomCount} onChange={(v) => set("bathroomCount", v)} />
					<StepperField label="Size" value={draft.size ?? 0} onChange={(v) => set("size", v || undefined)} allowDecimal />
				</Box>

				<CommonFields draft={draft} set={set} viewDisabled={viewDisabled} />
			</Box>
		</Box>
	);
}
