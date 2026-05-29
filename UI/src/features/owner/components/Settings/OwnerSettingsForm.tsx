import { Box, Button, Card, CardContent, FormControlLabel, Stack, Switch, Typography, IconButton } from "@mui/material";
import { AddRounded, RemoveRounded } from "@mui/icons-material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useRef } from "react";
import type { DynamicPricingSettings, EarlyBirdConfig, LongStayConfig } from "../../types/pricing.types";

const floatingFilterLabelSx = {
	position: "absolute",
	top: -8,
	left: 12,
	px: 0.5,
	bgcolor: "background.paper",
	color: "text.secondary",
	fontSize: "0.75rem",
	lineHeight: 1,
	fontWeight: 500,
	zIndex: 1,
	pointerEvents: "none",
} as const;

type FormValues = {
	longStayEnabled: boolean;
	longStayThresholdNights: number;
	longStayDiscountRate: number; // 0..50 (percent)
	earlyBirdEnabled: boolean;
	earlyBirdLeadDays: number;
	earlyBirdDiscountRate: number; // 0..50 (percent)
};

interface Props {
	value: DynamicPricingSettings | null;
	onChange?: (next: DynamicPricingSettings | null) => void;
	onSubmit?: (next: DynamicPricingSettings | null) => void | Promise<void>;
	disabled?: boolean;
	submitLabel?: string;
	hideSubmit?: boolean;
}

const fromSettings = (s: DynamicPricingSettings | null | undefined): FormValues => ({
	longStayEnabled: s?.longStayConfig?.enabled ?? !!s?.longStayConfig,
	longStayThresholdNights: s?.longStayConfig?.thresholdNights ?? 3,
	longStayDiscountRate: (s?.longStayConfig?.discountRate ?? 0.1) * 100,
	earlyBirdEnabled: s?.earlyBirdConfig?.enabled ?? !!s?.earlyBirdConfig,
	earlyBirdLeadDays: s?.earlyBirdConfig?.leadDays ?? 7,
	earlyBirdDiscountRate: (s?.earlyBirdConfig?.discountRate ?? 0.05) * 100,
});

const toSettings = (v: FormValues): DynamicPricingSettings | null => {
	const longStay: LongStayConfig | undefined = v.longStayEnabled
		? {
				enabled: true,
				thresholdNights: Math.max(2, Math.floor(v.longStayThresholdNights)),
				discountRate: Math.min(0.5, Math.max(0, v.longStayDiscountRate / 100)),
			}
		: undefined;
	const earlyBird: EarlyBirdConfig | undefined = v.earlyBirdEnabled
		? {
				enabled: true,
				leadDays: Math.max(1, Math.floor(v.earlyBirdLeadDays)),
				discountRate: Math.min(0.5, Math.max(0, v.earlyBirdDiscountRate / 100)),
			}
		: undefined;
	
	// Create the settings object. Ensure we return an object with the configs, 
	// even if they are undefined (disabled), unless BOTH are undefined.
	if (!longStay && !earlyBird) return null;
	return { longStayConfig: longStay, earlyBirdConfig: earlyBird };
};

// Reusable spinner component
const NumberSpinner = ({ 
	label, 
	value, 
	onChange, 
	min, 
	max, 
	disabled, 
	errorText 
}: { 
	label: string; 
	value: number; 
	onChange: (val: number) => void; 
	min: number; 
	max?: number; 
	disabled?: boolean;
	errorText?: string;
}) => (
	<Box sx={{ width: "100%", position: "relative" }}>
		<Box
			sx={{
				height: 56,
				position: "relative",
				px: 1.5,
				border: "1px solid",
				borderColor: errorText ? "error.main" : "divider",
				borderRadius: 1,
				bgcolor: disabled ? "action.disabledBackground" : "background.paper",
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				transition: "border-color 0.15s ease, background-color 0.15s ease",
				"&:hover": {
					borderColor: disabled ? "divider" : errorText ? "error.main" : "primary.main",
					bgcolor: disabled ? "action.disabledBackground" : "action.hover",
				},
			}}
		>
			<Typography sx={{ ...floatingFilterLabelSx, color: errorText ? "error.main" : "text.secondary" }}>
				{label}
			</Typography>
			<Box sx={{ px: 0.75, minWidth: 0 }}>
				<Typography sx={{ fontSize: "1.15rem", lineHeight: 1.2, color: disabled ? "text.disabled" : "text.primary" }}>
					{value}
				</Typography>
			</Box>
			<Stack direction="row" spacing={0.75} alignItems="center">
				<IconButton
					size="small"
					disabled={disabled || value <= min}
					onClick={() => onChange(Math.max(min, value - 1))}
					sx={{ border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}
				>
					<RemoveRounded fontSize="small" />
				</IconButton>
				<IconButton
					size="small"
					disabled={disabled || (max !== undefined && value >= max)}
					onClick={() => onChange(max !== undefined ? Math.min(max, value + 1) : value + 1)}
					sx={{ border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}
				>
					<AddRounded fontSize="small" />
				</IconButton>
			</Stack>
		</Box>
		{errorText && (
			<Typography variant="caption" color="error.main" sx={{ pl: 1.5, mt: 0.5, display: "block" }}>
				{errorText}
			</Typography>
		)}
	</Box>
);

export const OwnerSettingsForm = ({ value, onChange, onSubmit, disabled, submitLabel = "Save settings", hideSubmit }: Props) => {
	const { control, handleSubmit, watch } = useForm<FormValues>({
		defaultValues: fromSettings(value),
	});

	// Emit every change up to the parent so the wizard cannot lose user input.
	useEffect(() => {
		if (!onChange) return;
		const sub = watch((v) => {
			onChange(toSettings(v as FormValues));
		});
		return () => sub.unsubscribe();
	}, [watch, onChange]);

	const longStayEnabled = watch("longStayEnabled");
	const earlyBirdEnabled = watch("earlyBirdEnabled");

	return (
		<Box component="form" onSubmit={onSubmit ? handleSubmit((v) => onSubmit(toSettings(v))) : (e) => e.preventDefault()} noValidate>
			<Stack spacing={3}>
				<Card variant="outlined">
					<CardContent>
						<Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
							<Box>
								<Typography variant="h6" fontWeight={700}>
									Long-stay discount
								</Typography>
								<Typography variant="body2" color="text.secondary">
									Apply a discount when the guest books ≥ N nights.
								</Typography>
							</Box>
							<Controller
								name="longStayEnabled"
								control={control}
								render={({ field }) => (
									<FormControlLabel
										control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} disabled={disabled} />}
										label={field.value ? "On" : "Off"}
										sx={{ "& .MuiFormControlLabel-label": { fontWeight: 600, fontSize: "0.9rem" } }}
									/>
								)}
							/>
						</Stack>
						<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
							<Controller
								name="longStayThresholdNights"
								control={control}
								rules={{ required: true, min: 2 }}
								render={({ field, fieldState }) => (
									<NumberSpinner
										label="Threshold nights (≥ 2)"
										value={field.value}
										onChange={field.onChange}
										min={2}
										disabled={disabled || !longStayEnabled}
										errorText={fieldState.error?.type === "min" ? "Min 2" : undefined}
									/>
								)}
							/>
							<Controller
								name="longStayDiscountRate"
								control={control}
								rules={{ required: true, min: 0, max: 50 }}
								render={({ field, fieldState }) => (
									<NumberSpinner
										label="Discount % (0–50)"
										value={field.value}
										onChange={field.onChange}
										min={0}
										max={50}
										disabled={disabled || !longStayEnabled}
										errorText={fieldState.error ? "Must be in [0, 50]" : undefined}
									/>
								)}
							/>
						</Stack>
					</CardContent>
				</Card>

				<Card variant="outlined">
					<CardContent>
						<Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
							<Box>
								<Typography variant="h6" fontWeight={700}>
									Early-bird discount
								</Typography>
								<Typography variant="body2" color="text.secondary">
									Discount when the guest books ≥ X days before check-in.
								</Typography>
							</Box>
							<Controller
								name="earlyBirdEnabled"
								control={control}
								render={({ field }) => (
									<FormControlLabel
										control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} disabled={disabled} />}
										label={field.value ? "On" : "Off"}
										sx={{ "& .MuiFormControlLabel-label": { fontWeight: 600, fontSize: "0.9rem" } }}
									/>
								)}
							/>
						</Stack>
						<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
							<Controller
								name="earlyBirdLeadDays"
								control={control}
								rules={{ required: true, min: 1 }}
								render={({ field, fieldState }) => (
									<NumberSpinner
										label="Lead days (≥ 1)"
										value={field.value}
										onChange={field.onChange}
										min={1}
										disabled={disabled || !earlyBirdEnabled}
										errorText={fieldState.error?.type === "min" ? "Min 1" : undefined}
									/>
								)}
							/>
							<Controller
								name="earlyBirdDiscountRate"
								control={control}
								rules={{ required: true, min: 0, max: 50 }}
								render={({ field, fieldState }) => (
									<NumberSpinner
										label="Discount % (0–50)"
										value={field.value}
										onChange={field.onChange}
										min={0}
										max={50}
										disabled={disabled || !earlyBirdEnabled}
										errorText={fieldState.error ? "Must be in [0, 50]" : undefined}
									/>
								)}
							/>
						</Stack>
					</CardContent>
				</Card>

				{!hideSubmit && onSubmit && (
					<Box display="flex" justifyContent="flex-end">
						<Button type="submit" variant="contained" disabled={disabled}>
							{submitLabel}
						</Button>
					</Box>
				)}
			</Stack>
		</Box>
	);
};

export default OwnerSettingsForm;
