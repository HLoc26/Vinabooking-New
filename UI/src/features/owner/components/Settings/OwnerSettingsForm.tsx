import { Box, Button, Card, CardContent, FormControlLabel, Stack, Switch, TextField, Typography } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useRef } from "react";
import type { DynamicPricingSettings, EarlyBirdConfig, LongStayConfig } from "../../types/pricing.types";

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
	if (!longStay && !earlyBird) return null;
	return { longStayConfig: longStay, earlyBirdConfig: earlyBird };
};

export const OwnerSettingsForm = ({ value, onChange, onSubmit, disabled, submitLabel = "Save settings", hideSubmit }: Props) => {
	const { control, handleSubmit, watch, reset } = useForm<FormValues>({
		defaultValues: fromSettings(value),
	});

	// Re-sync when parent pushes a different value (e.g., after a save round-trip).
	const lastExternal = useRef(value);
	useEffect(() => {
		if (lastExternal.current !== value) {
			lastExternal.current = value;
			reset(fromSettings(value));
		}
	}, [value, reset]);

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
								<Typography variant="h6">Long-stay discount</Typography>
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
									<TextField
										{...field}
										type="number"
										label="Threshold nights (≥ 2)"
										fullWidth
										disabled={disabled || !longStayEnabled}
										inputProps={{ min: 2, step: 1 }}
										onChange={(e) => field.onChange(Number(e.target.value))}
										error={!!fieldState.error}
										helperText={fieldState.error?.type === "min" ? "Min 2" : undefined}
									/>
								)}
							/>
							<Controller
								name="longStayDiscountRate"
								control={control}
								rules={{ required: true, min: 0, max: 50 }}
								render={({ field, fieldState }) => (
									<TextField
										{...field}
										type="number"
										label="Discount % (0–50)"
										fullWidth
										disabled={disabled || !longStayEnabled}
										inputProps={{ min: 0, max: 50, step: 1 }}
										onChange={(e) => field.onChange(Number(e.target.value))}
										error={!!fieldState.error}
										helperText={fieldState.error ? "Must be in [0, 50]" : undefined}
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
								<Typography variant="h6">Early-bird discount</Typography>
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
									<TextField
										{...field}
										type="number"
										label="Lead days (≥ 1)"
										fullWidth
										disabled={disabled || !earlyBirdEnabled}
										inputProps={{ min: 1, step: 1 }}
										onChange={(e) => field.onChange(Number(e.target.value))}
										error={!!fieldState.error}
										helperText={fieldState.error?.type === "min" ? "Min 1" : undefined}
									/>
								)}
							/>
							<Controller
								name="earlyBirdDiscountRate"
								control={control}
								rules={{ required: true, min: 0, max: 50 }}
								render={({ field, fieldState }) => (
									<TextField
										{...field}
										type="number"
										label="Discount % (0–50)"
										fullWidth
										disabled={disabled || !earlyBirdEnabled}
										inputProps={{ min: 0, max: 50, step: 1 }}
										onChange={(e) => field.onChange(Number(e.target.value))}
										error={!!fieldState.error}
										helperText={fieldState.error ? "Must be in [0, 50]" : undefined}
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
