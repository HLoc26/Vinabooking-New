import { useEffect, useState } from "react";
import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";
import OwnerSettingsForm from "../components/Settings/OwnerSettingsForm";
import OwnerHolidayForm from "../components/Settings/OwnerHolidayForm";
import { getHolidayCatalog, getOwnerHolidays, getOwnerSettings, replaceOwnerHolidays, updateOwnerSettings } from "../services/ownerPricingApi";
import { usePushNotificationContext } from "../../../context/PushNotification/hook";
import type { DynamicPricingSettings, HolidayDto, HolidayOptIn, OwnerHolidayRow, OwnerSettingsResponse } from "../types/pricing.types";

const SettingsPage = () => {
	const { pushNotification } = usePushNotificationContext();

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [profile, setProfile] = useState<OwnerSettingsResponse | null>(null);
	const [settings, setSettings] = useState<DynamicPricingSettings | null>(null);
	const [catalog, setCatalog] = useState<HolidayDto[]>([]);
	const [optIns, setOptIns] = useState<HolidayOptIn[]>([]);

	useEffect(() => {
		const load = async () => {
			try {
				const [s, c, h] = await Promise.all([getOwnerSettings(), getHolidayCatalog(), getOwnerHolidays()]);
				setProfile(s);
				setSettings(s.dynamicPricingSettings);
				setCatalog(c);
				setOptIns(
					h.map((row: OwnerHolidayRow) => ({
						holidayCode: row.holidayCode,
						priceMultiplier: row.priceMultiplier,
						preDays: row.preDays,
						postDays: row.postDays,
						enabled: row.enabled,
					}))
				);
			} catch (err) {
				const message = err instanceof Error ? err.message : "Failed to load settings";
				pushNotification(message, "error");
			} finally {
				setLoading(false);
			}
		};
		load();
	}, [pushNotification]);

	const saveSettings = async (next: DynamicPricingSettings | null) => {
		setSaving(true);
		try {
			const saved = await updateOwnerSettings(next);
			setProfile(saved);
			setSettings(saved.dynamicPricingSettings);
			pushNotification("Default pricing settings saved.", "success");
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to save settings";
			pushNotification(message, "error");
		} finally {
			setSaving(false);
		}
	};

	const saveHolidays = async (items: HolidayOptIn[]) => {
		setSaving(true);
		try {
			const saved = await replaceOwnerHolidays(items);
			setOptIns(
				saved.map((row: OwnerHolidayRow) => ({
					holidayCode: row.holidayCode,
					priceMultiplier: row.priceMultiplier,
					preDays: row.preDays,
					postDays: row.postDays,
					enabled: row.enabled,
				}))
			);
			pushNotification("Default holidays saved.", "success");
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to save holidays";
			pushNotification(message, "error");
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box p={3}>
			<Stack spacing={3} maxWidth={900} mx="auto">
				<Box>
					<Typography variant="h4" fontWeight={800} color="primary.main">
						Owner settings
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Manage default pricing behavior and holiday surcharges.
					</Typography>
				</Box>
				<Alert severity="info">
					These defaults apply only to <strong>newly created</strong> accommodations. To edit an existing one, open its Manage Accommodation page.
				</Alert>

				<Box>
					<Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
						Default discount rules
					</Typography>
					<OwnerSettingsForm value={settings} onSubmit={saveSettings} disabled={saving} />
				</Box>

				<Box>
					<Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
						Default holiday pricing
					</Typography>
					<Typography variant="body2" color="text.secondary" mb={2}>
						Pick holidays that apply a price multiplier on the night. Recurring holidays are matched every year.
					</Typography>
					<OwnerHolidayForm catalog={catalog} value={optIns} onChange={setOptIns} onSubmit={saveHolidays} disabled={saving} />
				</Box>

				{profile && (
					<Typography variant="caption" color="text.secondary">
						Owner profile {profile.ownerProfileId}
					</Typography>
				)}
			</Stack>
		</Box>
	);
};

export default SettingsPage;
