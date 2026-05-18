import { useEffect, useState } from "react";
import { Alert, Box, CircularProgress, FormControl, FormControlLabel, Radio, RadioGroup, Stack, Typography } from "@mui/material";
import OwnerSettingsForm from "../../Settings/OwnerSettingsForm";
import OwnerHolidayForm from "../../Settings/OwnerHolidayForm";
import { getHolidayCatalog, getOwnerHolidays, getOwnerSettings, updateAccommodationPricingSettings } from "../../../services/ownerPricingApi";
import type { DynamicPricingSettings, HolidayDto, HolidayOptIn, OwnerHolidayRow } from "../../../types/pricing.types";

interface Props {
	accommodationId?: string;
	triggerSubmit: boolean;
	resetTrigger: () => void;
	onSuccess: () => void;
	onError: (msg: string) => void;
}

const StepPricingBox: React.FC<Props> = ({ accommodationId, triggerSubmit, resetTrigger, onSuccess, onError }) => {
	const [mode, setMode] = useState<"inherit" | "customize">("inherit");
	const [loading, setLoading] = useState(true);
	const [ownerSettings, setOwnerSettings] = useState<DynamicPricingSettings | null>(null);
	const [catalog, setCatalog] = useState<HolidayDto[]>([]);
	const [ownerHolidays, setOwnerHolidays] = useState<OwnerHolidayRow[]>([]);

	// Drafts of the override forms (only used when mode === "customize").
	const [overrideSettings, setOverrideSettings] = useState<DynamicPricingSettings | null>(null);
	const [overrideHolidays, setOverrideHolidays] = useState<HolidayOptIn[] | null>(null);

	useEffect(() => {
		const load = async () => {
			try {
				const [s, c, h] = await Promise.all([getOwnerSettings(), getHolidayCatalog(), getOwnerHolidays()]);
				setOwnerSettings(s.dynamicPricingSettings);
				setCatalog(c);
				setOwnerHolidays(h);
				// Pre-populate the customize forms with owner defaults so toggling to customize starts there.
				setOverrideSettings(s.dynamicPricingSettings);
				setOverrideHolidays(h.map((row) => ({ holidayId: row.holidayId, priceMultiplier: row.priceMultiplier, enabled: row.enabled })));
			} catch (err) {
				const message = err instanceof Error ? err.message : "Failed to load pricing settings";
				onError(message);
			} finally {
				setLoading(false);
			}
		};
		load();
	}, [onError]);

	useEffect(() => {
		if (!triggerSubmit) return;
		const submit = async () => {
			try {
				if (!accommodationId) throw new Error("Accommodation not created yet. Go back to Basic Info.");
				if (mode === "inherit") {
					// Backend already inherited at create-time. Nothing to do.
				} else {
					await updateAccommodationPricingSettings(accommodationId, {
						dynamicPricingSettings: overrideSettings,
						holidayOptIns: overrideHolidays,
					});
				}
				onSuccess();
			} catch (err) {
				const message = err instanceof Error ? err.message : "Failed to save pricing settings";
				onError(message);
			} finally {
				resetTrigger();
			}
		};
		submit();
	}, [triggerSubmit, accommodationId, mode, overrideSettings, overrideHolidays, onSuccess, onError, resetTrigger]);

	if (loading) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Stack spacing={3}>
			<Box>
				<Typography variant="h6">Dynamic pricing for this property</Typography>
				<Typography variant="body2" color="text.secondary">
					Choose whether to use your owner-wide defaults or set custom rules just for this property.
				</Typography>
			</Box>

			<FormControl>
				<RadioGroup value={mode} onChange={(_, v) => setMode(v as "inherit" | "customize")}>
					<FormControlLabel value="inherit" control={<Radio />} label="Use my default settings" />
					<FormControlLabel value="customize" control={<Radio />} label="Customize for this property" />
				</RadioGroup>
			</FormControl>

			{mode === "inherit" ? (
				<Alert severity="info">
					This property will use your owner-wide defaults. You can change them later from the Settings page (it only affects new properties)
					or from this property's Manage page.
				</Alert>
			) : (
				<Stack spacing={3}>
					<Box>
						<Typography variant="subtitle1" gutterBottom>
							Discount rules
						</Typography>
						<OwnerSettingsForm
							defaults={overrideSettings ?? ownerSettings}
							hideSubmit
							onSubmit={(next) => setOverrideSettings(next)}
						/>
						<Typography variant="caption" color="text.secondary">
							Changes apply when you click Next.
						</Typography>
					</Box>
					<Box>
						<Typography variant="subtitle1" gutterBottom>
							Holiday pricing
						</Typography>
						<OwnerHolidayForm
							catalog={catalog}
							current={
								overrideHolidays
									? overrideHolidays.map((o) => ({
											id: String(o.holidayId),
											holidayId: o.holidayId,
											priceMultiplier: o.priceMultiplier,
											enabled: o.enabled ?? true,
											holiday: catalog.find((c) => c.id === o.holidayId) ?? { id: o.holidayId, name: "—", date: "", isRecurring: false },
										}))
									: ownerHolidays
							}
							hideSubmit
							onSubmit={(items) => setOverrideHolidays(items)}
						/>
					</Box>
				</Stack>
			)}
		</Stack>
	);
};

export default StepPricingBox;
