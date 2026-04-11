import { Box, Typography } from "@mui/material";
import { useState } from "react";

// ─── STEPPER FIELD ──────────────────────────────────────────────────────────
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
