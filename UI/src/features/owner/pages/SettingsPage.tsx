import { useEffect, useState } from "react";
import { Alert, Box, Button, CircularProgress, Stack, Typography, Paper, Divider } from "@mui/material";
import { SyncRounded, WarningAmberRounded } from "@mui/icons-material";
import OwnerSettingsForm from "../components/Settings/OwnerSettingsForm";
import OwnerHolidayForm from "../components/Settings/OwnerHolidayForm";
import {
	getHolidayCatalog,
	getOwnerHolidays,
	getOwnerSettings,
	replaceOwnerHolidays,
	syncAllAccommodations,
	updateOwnerSettings,
} from "../services/ownerPricingApi";
import { usePushNotificationContext } from "../../../context/PushNotification/hook";
import useModalContext from "../../../context/ModalContext/hook";
import type { DynamicPricingSettings, HolidayDto, HolidayOptIn, OwnerHolidayRow, OwnerSettingsResponse } from "../types/pricing.types";

const SettingsPage = () => {
	const { pushNotification } = usePushNotificationContext();
	const { openModal, closeModal } = useModalContext();

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [syncing, setSyncing] = useState(false);
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

	const handleForceSync = async () => {
		setSyncing(true);
		try {
			const result = await syncAllAccommodations();
			pushNotification(`Successfully updated ${result.updatedCount} accommodations.`, "success");
			closeModal();
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to sync accommodations";
			pushNotification(message, "error");
		} finally {
			setSyncing(false);
		}
	};

	const openSyncModal = () => {
		openModal(
			<Box sx={{ p: 4, maxWidth: 450 }}>
				<Stack spacing={3} alignItems="center" textAlign="center">
					<Box
						sx={{
							width: 64,
							height: 64,
							borderRadius: "50%",
							bgcolor: "error.main",
							color: "white",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							mb: 1,
						}}
					>
						<WarningAmberRounded sx={{ fontSize: 40 }} />
					</Box>
					<Box>
						<Typography variant="h5" fontWeight={800} color="error.main" gutterBottom>
							Irreversible Action!
						</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
							This will overwrite the pricing rules and holiday settings for <strong>ALL</strong> of your existing accommodations with the current global defaults.
						</Typography>
						<Typography variant="body2" fontWeight={700} color="text.primary" sx={{ mt: 2, bgcolor: "rgba(255,255,255,0.05)", p: 1.5, borderRadius: 2 }}>
							Any custom pricing you set per property will be lost.
						</Typography>
					</Box>
					<Stack direction="row" spacing={2} width="100%">
						<Button variant="text" color="inherit" fullWidth onClick={closeModal} disabled={syncing} sx={{ fontWeight: 600 }}>
							Cancel
						</Button>
						<Button
							variant="contained"
							color="error"
							fullWidth
							startIcon={syncing ? <CircularProgress size={16} color="inherit" /> : <SyncRounded />}
							onClick={handleForceSync}
							disabled={syncing}
							sx={{ fontWeight: 700 }}
						>
							Apply to All
						</Button>
					</Stack>
				</Stack>
			</Box>
		);
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

				<Divider sx={{ my: 4 }} />

				<Paper
					variant="outlined"
					sx={{
						p: 3,
						borderRadius: 4,
						border: "1px solid",
						borderColor: "rgba(244, 67, 54, 0.3)",
						bgcolor: "rgba(244, 67, 54, 0.02)",
					}}
				>
					<Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="center" justifyContent="space-between">
						<Box>
							<Typography variant="h6" fontWeight={700} color="error.main" display="flex" alignItems="center" gap={1}>
								<WarningAmberRounded fontSize="small" /> Danger Zone
							</Typography>
							<Typography variant="body2" color="text.secondary" mt={1}>
								Force your global defaults (above) onto all existing accommodations.
								<br />
								<strong>Caution:</strong> This overrides any custom pricing you've set for individual properties.
							</Typography>
						</Box>
						<Button
							variant="outlined"
							color="error"
							startIcon={<SyncRounded />}
							onClick={openSyncModal}
							sx={{
								borderRadius: "10px",
								fontWeight: 700,
								px: 3,
								whiteSpace: "nowrap",
								"&:hover": { bgcolor: "rgba(244, 67, 54, 0.08)" },
							}}
						>
							Sync All Accommodations
						</Button>
					</Stack>
				</Paper>

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
