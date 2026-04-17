import * as React from "react";
import { FormHelperText } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface NumberFieldProps {
	id?: string;
	label?: string;
	size?: "small" | "medium";
	suffix?: string;
	step?: number;
	value?: number | null;
	onValueChange?: (value: number | null) => void;
	max?: number;
	min?: number;
	onValidate?: (isValid: boolean) => void;
}

export default function NumberField({ id: idProp, label, size = "medium", suffix, step = 1000, value, onValueChange, max = 100000000, min = 0, onValidate }: NumberFieldProps) {
	const theme = useTheme();

	const generatedId = React.useId();
	const id = idProp || generatedId;

	const isSmall = size === "small";

	// ===== FORMAT / PARSE =====
	const format = (num: number | null) => {
		if (num == null) return "";
		return new Intl.NumberFormat("vi-VN").format(num);
	};

	const parse = (str: string) => {
		const digits = str.replace(/[^\d]/g, "");
		return digits ? Number(digits) : null;
	};

	const isTypingRef = React.useRef(false);
	// display state (string)
	const [display, setDisplay] = React.useState(format(value ?? null));

	// sync external value
	React.useEffect(() => {
		if (!isTypingRef.current) {
			setDisplay(format(value ?? null));
		}
		isTypingRef.current = false;
	}, [value]);

	// ===== VALIDATION =====
	const isOverMax = value != null && value > max;
	const isUnderMin = value != null && value < min;
	const isInvalid = isOverMax || isUnderMin;

	React.useEffect(() => {
		onValidate?.(!isInvalid);
	}, [isInvalid, onValidate]);

	// ===== UI STATE =====
	const [focused, setFocused] = React.useState(false);
	const [hovered, setHovered] = React.useState(false);

	const borderColor = isInvalid ? theme.palette.error.main : focused ? theme.palette.primary.main : hovered ? theme.palette.text.primary : theme.palette.divider;

	const boxShadow = focused ? `0 0 0 2px ${isInvalid ? theme.palette.error.main : theme.palette.primary.main}33` : "none";

	// ===== INPUT HANDLER =====
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value;
		const parsed = parse(raw);

		if (parsed === null) {
			setDisplay("");
		} else {
			setDisplay(new Intl.NumberFormat("vi-VN").format(parsed));
		}
		onValueChange?.(parsed);
	};

	// ===== STEPPER WITH HOLD-TO-REPEAT =====
	// Use a ref to always access the latest value inside the interval callback
	const valueRef = React.useRef(value);
	React.useEffect(() => {
		valueRef.current = value;
	}, [value]);

	const holdTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
	const holdIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

	const clearHold = () => {
		if (holdTimerRef.current) {
			clearTimeout(holdTimerRef.current);
			holdTimerRef.current = null;
		}
		if (holdIntervalRef.current) {
			clearInterval(holdIntervalRef.current);
			holdIntervalRef.current = null;
		}
	};

	const startHold = (direction: 1 | -1) => {
		// Fire once immediately
		const fire = () => onValueChange?.((valueRef.current ?? 0) + direction * step);
		fire();

		// After 400ms initial delay, start repeating every 80ms
		holdTimerRef.current = setTimeout(() => {
			holdIntervalRef.current = setInterval(fire, 80);
		}, 400);
	};

	// Clean up on unmount
	React.useEffect(() => () => clearHold(), []);

	const stepperButtonHandlers = (direction: 1 | -1) => ({
		onMouseDown: (e: React.MouseEvent) => {
			e.preventDefault(); // prevent input blur
			startHold(direction);
		},
		onMouseUp: clearHold,
		onMouseLeave: clearHold,
		onTouchStart: (e: React.TouchEvent) => {
			e.preventDefault();
			startHold(direction);
		},
		onTouchEnd: clearHold,
	});

	return (
		<div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
			<div
				style={{
					position: "relative",
					width: "100%",
					display: "flex",
					alignItems: "stretch",
					border: `1px solid ${borderColor}`,
					borderRadius: 6,
					height: isSmall ? 40 : 56,
					backgroundColor: theme.palette.background.paper,
					boxSizing: "border-box",
					transition: "all 0.2s ease",
					boxShadow,
				}}
				onMouseEnter={() => setHovered(true)}
				onMouseLeave={() => setHovered(false)}
				onFocus={() => setFocused(true)}
				onBlur={(e) => {
					if (!e.currentTarget.contains(e.relatedTarget as Node)) {
						setFocused(false);
					}
				}}
			>
				{/* Label */}
				{label && (
					<label
						htmlFor={id}
						style={{
							position: "absolute",
							top: isSmall ? -8 : -10,
							left: 10,
							backgroundColor: theme.palette.background.paper,
							padding: "0 4px",
							fontSize: isSmall ? 11 : 12,
							color: isInvalid ? theme.palette.error.main : focused ? theme.palette.primary.main : theme.palette.text.secondary,
							zIndex: 1,
							pointerEvents: "none",
						}}
					>
						{label}
					</label>
				)}

				{/* INPUT */}
				<input
					id={id}
					value={display}
					onChange={handleChange}
					inputMode="numeric"
					style={{
						flex: 1,
						border: "none",
						outline: "none",
						background: "transparent",
						padding: isSmall ? "0 8px 0 12px" : "0 8px 0 14px",
						fontSize: isSmall ? 13 : 15,
						fontWeight: 600,
						color: theme.palette.text.primary,
						width: "100%",
					}}
				/>

				{/* Suffix */}
				{suffix && (
					<span
						style={{
							display: "flex",
							alignItems: "center",
							paddingRight: 6,
							fontSize: isSmall ? 11 : 12,
							fontWeight: 600,
							color: theme.palette.text.disabled,
							userSelect: "none",
						}}
					>
						{suffix}
					</span>
				)}

				{/* Divider */}
				<div
					style={{
						width: 1,
						backgroundColor: theme.palette.divider,
					}}
				/>

				{/* Stepper */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						width: isSmall ? 28 : 32,
						backgroundColor: theme.palette.action.hover,
						borderRadius: "0 6px 6px 0",
						overflow: "hidden",
					}}
				>
					<button
						type="button"
						{...stepperButtonHandlers(1)}
						style={{
							flex: 1,
							border: "none",
							background: "transparent",
							cursor: "pointer",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color: theme.palette.text.secondary,
						}}
					>
						<svg width="12" height="12" viewBox="0 0 24 24">
							<path d="M6 14l6-6 6 6" stroke="currentColor" strokeWidth="1.5" fill="none" />
						</svg>
					</button>

					<button
						type="button"
						{...stepperButtonHandlers(-1)}
						style={{
							flex: 1,
							border: "none",
							background: "transparent",
							cursor: "pointer",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color: theme.palette.text.secondary,
						}}
					>
						<svg width="12" height="12" viewBox="0 0 24 24">
							<path d="M6 10l6 6 6-6" stroke="currentColor" strokeWidth="1.5" fill="none" />
						</svg>
					</button>
				</div>
			</div>
		</div>
	);
}
