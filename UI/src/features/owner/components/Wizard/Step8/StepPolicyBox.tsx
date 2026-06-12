import { useEffect, type ElementType } from "react";
import { Box, Typography, TextField, Switch, FormControlLabel, Grid, Paper, Stack } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useForm, Controller } from "react-hook-form";
import { useUpdatePolicy } from "../../../hooks/useUpdatePolicy";
import { EPrepaymentPolicy, ECancellationPolicy } from "../../../types/owner.types";
import type { UpdatePolicyDTO, WizardForm } from "../../../types/owner.types";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SecurityIcon from "@mui/icons-material/Security";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import LockIcon from "@mui/icons-material/Lock";
import UpdateIcon from "@mui/icons-material/Update";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PaymentsIcon from "@mui/icons-material/Payments";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface Props {
	form: WizardForm;
	setForm: React.Dispatch<React.SetStateAction<WizardForm>>;
	triggerSubmit: boolean;
	resetTrigger: () => void;
	onSuccess: () => void;
}

const CANCELLATION_OPTIONS = [
	{ value: ECancellationPolicy.CANCEL_NONE, label: "No Cancellation", icon: LockIcon },
	{ value: ECancellationPolicy.CANCEL_24H, label: "24h Before", icon: AccessTimeIcon },
	{ value: ECancellationPolicy.CANCEL_48H, label: "48h Before", icon: UpdateIcon },
	{ value: ECancellationPolicy.CANCEL_7D, label: "7 Days Before", icon: CalendarMonthIcon },
	{ value: ECancellationPolicy.CANCEL_14D, label: "14 Days Before", icon: CalendarMonthIcon },
];

const PREPAYMENT_OPTIONS = [
	{ value: EPrepaymentPolicy.PREPAY_NONE, label: "No Prepayment", icon: PaymentsIcon },
	{ value: EPrepaymentPolicy.PREPAY_50, label: "50% Deposit", icon: CreditCardIcon },
	{ value: EPrepaymentPolicy.PREPAY_100, label: "100% Full", icon: CheckCircleIcon },
];

const PolicySelectCard = ({ selected, onClick, icon: Icon, label }: { selected: boolean; onClick: () => void; icon: ElementType; label: string }) => (
	<Box
		onClick={onClick}
		sx={{
			p: 3,
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			justifyContent: "center",
			gap: 2,
			cursor: "pointer",
			borderRadius: 3,
			border: "2px solid",
			borderColor: selected ? "primary.main" : "divider",
			bgcolor: selected ? (theme) => alpha(theme.palette.primary.main, 0.05) : "background.paper",
			transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
			"&:hover": {
				borderColor: "primary.main",
				bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
				boxShadow: (theme) => `0 12px 24px ${alpha(theme.palette.common.black, 0.1)}`,
				transform: "translateY(-4px)",
			},
			textAlign: "center",
			height: "100%",
			position: "relative",
			...(selected && {
				boxShadow: (theme) => `0 8px 16px ${alpha(theme.palette.primary.main, 0.15)}`,
			}),
		}}
	>
		<Icon sx={{ fontSize: 40, color: selected ? "primary.main" : "text.secondary" }} />
		<Typography variant="subtitle2" fontWeight={600} color={selected ? "primary.main" : "text.primary"} sx={{ lineHeight: 1.2 }}>
			{label}
		</Typography>
	</Box>
);

const StepPolicyBox = ({ form, setForm, triggerSubmit, resetTrigger, onSuccess }: Props) => {
	const { mutate } = useUpdatePolicy(form.accommodationId ?? "");

	const { control, handleSubmit, watch } = useForm<UpdatePolicyDTO>({
		defaultValues: form.policy || {
			checkInTime: "14:00",
			checkOutTime: "12:00",
			prepaymentPolicy: EPrepaymentPolicy.PREPAY_NONE,
			cancellationPolicy: ECancellationPolicy.CANCEL_24H,
			allowsPets: false,
			allowsSmoking: false,
			allowsParties: false,
			quietHoursStart: "22:00",
			quietHoursEnd: "06:00",
		},
	});

	const watchedValues = watch();
	const watchedString = JSON.stringify(watchedValues);

	// Sync to parent
	useEffect(() => {
		const safePolicyData = JSON.parse(watchedString);
		setForm((prev) => ({
			...prev,
			policy: safePolicyData,
		}));
	}, [watchedString, setForm]);

	useEffect(() => {
		if (!triggerSubmit) return;

		const handleInternalSubmit = handleSubmit((data) => {
			mutate(data, {
				onSuccess: () => {
					onSuccess();
				},
				onSettled: resetTrigger,
			});
		});

		handleInternalSubmit();
	}, [triggerSubmit, handleSubmit, mutate, onSuccess, resetTrigger]);

	return (
		<Box display="flex" flexDirection="column" gap={4}>
			<Box>
				<Typography variant="h5" fontWeight={700}>
					Accommodation Policies
				</Typography>
				<Typography variant="body2" color="text.secondary" mt={0.5}>
					Set the ground rules for your guests to ensure a smooth stay.
				</Typography>
			</Box>

			{/* Check-in / Check-out */}
			<Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
				<Stack direction="row" spacing={1} alignItems="center" mb={2}>
					<AccessTimeIcon color="primary" />
					<Typography variant="h6" fontWeight={600}>
						Arrival & Departure
					</Typography>
				</Stack>
				<Grid container spacing={3}>
					<Grid size={{ xs: 12, sm: 6 }}>
						<Controller
							name="checkInTime"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="Check-in Time"
									type="time"
									fullWidth
									slotProps={{ inputLabel: { shrink: true } }}
									sx={{
										"& .MuiSvgIcon-root": {
											color: (theme) => (theme.palette.mode === "dark" ? "#fff !important" : "inherit"),
										},
										"& input::-webkit-calendar-picker-indicator": {
											filter: (theme) => (theme.palette.mode === "dark" ? "invert(1) !important" : "none"),
											cursor: "pointer",
										},
									}}
								/>
							)}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6 }}>
						<Controller
							name="checkOutTime"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="Check-out Time"
									type="time"
									fullWidth
									slotProps={{ inputLabel: { shrink: true } }}
									sx={{
										"& .MuiSvgIcon-root": {
											color: (theme) => (theme.palette.mode === "dark" ? "#fff !important" : "inherit"),
										},
										"& input::-webkit-calendar-picker-indicator": {
											filter: (theme) => (theme.palette.mode === "dark" ? "invert(1) !important" : "none"),
											cursor: "pointer",
										},
									}}
								/>
							)}
						/>
					</Grid>
				</Grid>
			</Paper>

			{/* Cancellation & Prepayment */}
			<Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
				<Stack direction="row" spacing={1} alignItems="center" mb={3}>
					<SecurityIcon color="primary" />
					<Typography variant="h6" fontWeight={600}>
						Booking Policies
					</Typography>
				</Stack>
				<Stack spacing={4}>
					<Box>
						<Typography variant="subtitle2" fontWeight={700} mb={2} color="text.secondary">
							PREPAYMENT POLICY
						</Typography>
						<Controller
							name="prepaymentPolicy"
							control={control}
							render={({ field }) => (
								<Grid container spacing={2}>
									{PREPAYMENT_OPTIONS.map((opt) => (
										<Grid key={opt.value} size={{ xs: 12, sm: 4 }}>
											<PolicySelectCard selected={field.value === opt.value} onClick={() => field.onChange(opt.value)} icon={opt.icon} label={opt.label} />
										</Grid>
									))}
								</Grid>
							)}
						/>
					</Box>

					<Box>
						<Typography variant="subtitle2" fontWeight={700} mb={2} color="text.secondary">
							CANCELLATION POLICY
						</Typography>
						<Controller
							name="cancellationPolicy"
							control={control}
							render={({ field }) => (
								<Grid container spacing={2}>
									{CANCELLATION_OPTIONS.map((opt) => (
										<Grid key={opt.value} size={{ xs: 12, sm: 4 }}>
											<PolicySelectCard selected={field.value === opt.value} onClick={() => field.onChange(opt.value)} icon={opt.icon} label={opt.label} />
										</Grid>
									))}
								</Grid>
							)}
						/>
					</Box>

					<Controller
						name="cancellationDescription"
						control={control}
						render={({ field }) => (
							<TextField {...field} label="Cancellation Description (Optional)" multiline rows={2} fullWidth placeholder="e.g. Free cancellation until 24 hours before check-in." />
						)}
					/>
				</Stack>
			</Paper>

			{/* House Rules */}
			<Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
				<Stack direction="row" spacing={1} alignItems="center" mb={2}>
					<FactCheckIcon color="primary" />
					<Typography variant="h6" fontWeight={600}>
						House Rules
					</Typography>
				</Stack>
				<Grid container spacing={2} mb={3}>
					<Grid size={{ xs: 12, sm: 4 }}>
						<Controller
							name="allowsPets"
							control={control}
							render={({ field }) => <FormControlLabel control={<Switch checked={field.value} onChange={field.onChange} />} label="Allows Pets" />}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 4 }}>
						<Controller
							name="allowsSmoking"
							control={control}
							render={({ field }) => <FormControlLabel control={<Switch checked={field.value} onChange={field.onChange} />} label="Allows Smoking" />}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 4 }}>
						<Controller
							name="allowsParties"
							control={control}
							render={({ field }) => <FormControlLabel control={<Switch checked={field.value} onChange={field.onChange} />} label="Allows Parties" />}
						/>
					</Grid>
				</Grid>

				<Grid container spacing={3} mb={3}>
					<Grid size={{ xs: 12, sm: 6 }}>
						<Controller
							name="quietHoursStart"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="Quiet Hours Start"
									type="time"
									fullWidth
									slotProps={{ inputLabel: { shrink: true } }}
									sx={{
										"& .MuiSvgIcon-root": {
											color: (theme) => (theme.palette.mode === "dark" ? "#fff !important" : "inherit"),
										},
										"& input::-webkit-calendar-picker-indicator": {
											filter: (theme) => (theme.palette.mode === "dark" ? "invert(1) !important" : "none"),
											cursor: "pointer",
										},
									}}
								/>
							)}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6 }}>
						<Controller
							name="quietHoursEnd"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="Quiet Hours End"
									type="time"
									fullWidth
									slotProps={{ inputLabel: { shrink: true } }}
									sx={{
										"& .MuiSvgIcon-root": {
											color: (theme) => (theme.palette.mode === "dark" ? "#fff !important" : "inherit"),
										},
										"& input::-webkit-calendar-picker-indicator": {
											filter: (theme) => (theme.palette.mode === "dark" ? "invert(1) !important" : "none"),
											cursor: "pointer",
										},
									}}
								/>
							)}
						/>
					</Grid>
				</Grid>

				<Controller
					name="additionalRules"
					control={control}
					render={({ field }) => <TextField {...field} label="Additional Rules" multiline rows={3} fullWidth placeholder="e.g. Please take off shoes inside, no loud music after 10 PM." />}
				/>
			</Paper>
		</Box>
	);
};

export default StepPolicyBox;
