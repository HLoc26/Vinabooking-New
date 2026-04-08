import { useState } from "react";
import { Box, TextField, MenuItem, Typography, InputAdornment, alpha } from "@mui/material";
import type { RoomForm } from "../../../types/owner.types";
import { VIEW_TYPES, PRICING_TYPES } from "../../../const/RoomConst";

interface Props {
	draft: RoomForm;
	set: (field: keyof RoomForm, value: any) => void;
	/** Controls visibility of bedroom/bathroom fields */
	rentalType?: string;
}

function StepperField({
	label,
	value,
	onChange,
	allowDecimal = false,
	min = 0,
	max,
}: {
	label: string;
	value: number | undefined;
	onChange: (v: number) => void;
	allowDecimal?: boolean;
	min?: number;
	max?: number;
}) {
	const [raw, setRaw] = useState<string>(String(value ?? 0));
	const [focused, setFocused] = useState(false);

	const current = value ?? 0;

	if (!focused && raw !== String(value ?? 0)) {
		setRaw(String(value ?? 0));
	}

	const clamp = (n: number) => {
		let v = Math.max(min, n);
		if (max !== undefined) v = Math.min(max, v);
		return v;
	};

	const commit = (str: string) => {
		setFocused(false);
		const parsed = parseFloat(str);
		if (!isNaN(parsed)) {
			const clamped = clamp(parsed);
			onChange(clamped);
			setRaw(String(clamped));
		} else {
			setRaw(String(current));
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const v = e.target.value;
		if (allowDecimal) {
			if (/^\d*\.?\d*$/.test(v)) setRaw(v);
		} else {
			if (/^\d*$/.test(v)) setRaw(v);
		}
	};

	const step = (delta: number) => {
		const next = clamp(current + delta);
		onChange(next);
		setRaw(String(next));
	};

	const btnSx = {
		width: 30,
		height: 30,
		borderRadius: "50%",
		border: "1.5px solid",
		borderColor: "divider",
		bgcolor: "background.paper",
		cursor: "pointer",
		fontSize: 18,
		fontWeight: 700,
		color: "text.secondary",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
		"&:hover": { bgcolor: "action.hover", borderColor: "primary.main", color: "primary.main" },
		transition: "all 0.15s",
	} as const;

	return (
		<Box display="flex" alignItems="center" gap={0.75} width="100%">
			<Typography variant="body2" color="text.secondary" fontWeight={600} noWrap sx={{ flexShrink: 0, fontSize: 13, mr: 0.25 }}>
				{label}:
			</Typography>
			<Box flex={1} />
			<Box component="button" onClick={() => step(-1)} sx={btnSx}>
				−
			</Box>
			<Box
				component="input"
				value={raw}
				onChange={handleChange}
				onFocus={() => {
					setFocused(true);
					setRaw(String(current));
				}}
				onBlur={(e: React.FocusEvent<HTMLInputElement>) => commit(e.target.value)}
				onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
					if (e.key === "Enter") commit((e.target as HTMLInputElement).value);
				}}
				sx={{
					width: 52,
					height: 34,
					border: "1px solid",
					borderColor: "divider",
					borderRadius: 1.5,
					textAlign: "center",
					fontSize: 14,
					fontWeight: 600,
					color: "text.primary",
					bgcolor: "background.paper",
					outline: "none",
					flexShrink: 0,
					"&:focus": { borderColor: "primary.main", boxShadow: "0 0 0 2px rgba(25,118,210,0.15)" },
					"&::-webkit-inner-spin-button, &::-webkit-outer-spin-button": { appearance: "none" },
					MozAppearance: "textfield",
				}}
			/>
			<Box component="button" onClick={() => step(1)} sx={btnSx}>
				+
			</Box>
		</Box>
	);
}

export default function RoomInfoFields({ draft, set, rentalType }: Props) {
	const descLen = (draft.description || "").length;
	const viewDescLen = (draft.viewDescription || "").length;
	const viewDisabled = draft.viewType === "NONE";

	// PRIVATE_ROOM has no bedroom/bathroom concept
	const showBedroomBathroom = rentalType?.toUpperCase() !== "PRIVATE_ROOM";

	return (
		<Box>
			<Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={1.5} sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
				Room Info
			</Typography>

			<Box display="flex" flexDirection="column" gap={2.5}>
				{/* Row 1: Room Name */}
				<TextField
					fullWidth
					required
					label="Room Name"
					value={draft.name}
					onChange={(e) => set("name", e.target.value.slice(0, 50))}
					error={!draft.name.trim()}
					helperText={!draft.name.trim() ? "Required" : `${draft.name.length}/50`}
				/>

				{/* Row 2: Quantity | Max Adults | Max Children */}
				<Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={3}>
					<StepperField label="Quantity" value={draft.quantity} onChange={(v) => set("quantity", v)} min={1} max={99} />
					<StepperField label="Max Adults" value={draft.maxAdults} onChange={(v) => set("maxAdults", v)} min={1} max={99} />
					<StepperField label="Max Children" value={draft.maxChildren} onChange={(v) => set("maxChildren", v)} min={0} max={99} />
				</Box>

				{/* Row 3: Bedrooms | Bathrooms | Size — hidden for PRIVATE_ROOM */}
				{showBedroomBathroom ? (
					<Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={3}>
						<StepperField label="Bedrooms" value={draft.bedroomCount} onChange={(v) => set("bedroomCount", v)} min={0} max={99} />
						<StepperField label="Bathrooms" value={draft.bathroomCount} onChange={(v) => set("bathroomCount", v)} min={0} max={99} />
						<StepperField label="Size (m²)" value={draft.size ?? 0} onChange={(v) => set("size", v || undefined)} min={0} allowDecimal />
					</Box>
				) : (
					/* PRIVATE_ROOM: just size */
					<Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={3}>
						<StepperField label="Size (m²)" value={draft.size ?? 0} onChange={(v) => set("size", v || undefined)} min={0} allowDecimal />
					</Box>
				)}

				{/* Row 4: View Type + View Description */}
				<Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} alignItems="flex-start">
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
						sx={{
							// 1. Give the background a very light primary tint
							// 0.04 is usually the standard "hover/selected" opacity in MUI
							bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),

							// 2. Style the border to be primary but lighter
							"& .MuiOutlinedInput-notchedOutline": {
								borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
							},

							// 3. Ensure the border turns full primary on hover
							"&:hover .MuiOutlinedInput-notchedOutline": {
								borderColor: "primary.main",
							},

							// 4. Style the Label color
							"& .MuiInputLabel-root": {
								color: viewDisabled ? "text.disabled" : "primary.main",
							},

							borderRadius: 1,
						}}
					/>
				</Box>

				{/* Row 5: Price + Pricing Type */}
				<Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
					<TextField
						fullWidth
						label="Price"
						type="number"
						value={draft.price ?? ""}
						onChange={(e) => set("price", e.target.value ? Math.max(0, Number(e.target.value)) : undefined)}
						inputProps={{ min: 0 }}
						InputProps={{ endAdornment: <InputAdornment position="end">VND</InputAdornment> }}
					/>
					<TextField fullWidth select label="Pricing Type" value={draft.pricingType} onChange={(e) => set("pricingType", e.target.value)}>
						{PRICING_TYPES.map((t) => (
							<MenuItem key={t} value={t}>
								{t.replace(/_/g, " ")}
							</MenuItem>
						))}
					</TextField>
				</Box>

				{/* Row 6: Description */}
				<TextField
					fullWidth
					label="Description"
					multiline
					minRows={3}
					value={draft.description || ""}
					onChange={(e) => set("description", e.target.value.slice(0, 150))}
					helperText={`${descLen}/150`}
					FormHelperTextProps={{ sx: { textAlign: "right" } }}
				/>
			</Box>
		</Box>
	);
}
