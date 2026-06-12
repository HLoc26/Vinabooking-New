import { useState, useEffect, useMemo } from "react";
import {
	Box,
	TextField,
	CircularProgress,
	Typography,
	Button,
	Paper,
	Divider,
	Grid,
	Switch,
	FormControlLabel,
	MenuItem,
	Stack,
	alpha,
} from "@mui/material";
import { useForm, Controller, type Control } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import {
	EditOutlined,
	Close,
	Check,
	AccessTime,
	Security,
	FactCheck,
	PolicyOutlined,
	Pets,
	SmokingRooms,
	MusicNote,
	NotificationsActive,
	ListAlt,
	CancelOutlined,
	CheckCircleOutline,
} from "@mui/icons-material";

import { useUpdatePolicy } from "../../../hooks/useUpdatePolicy";
import { usePushNotificationContext } from "../../../../../context/PushNotification/hook";
import useModalContext from "../../../../../context/ModalContext/hook";
import { EPrepaymentPolicy, ECancellationPolicy } from "../../../types/owner.types";
import type { UpdatePolicyDTO } from "../../../types/owner.types";
import type { AccommodationHydrateResponse } from "../../../services/ownerApi";
import { FieldLabel, editFieldSx, getCardSx, getHeaderSx } from "../shared/CardSharedUI";

interface Props {
	accommodationId: string;
	accommodationData: AccommodationHydrateResponse;
}

const CANCELLATION_OPTIONS = [
	{ value: ECancellationPolicy.CANCEL_NONE, label: "No Cancellation" },
	{ value: ECancellationPolicy.CANCEL_24H, label: "24h Before" },
	{ value: ECancellationPolicy.CANCEL_48H, label: "48h Before" },
	{ value: ECancellationPolicy.CANCEL_7D, label: "7 Days Before" },
	{ value: ECancellationPolicy.CANCEL_14D, label: "14 Days Before" },
];

const PREPAYMENT_OPTIONS = [
	{ value: EPrepaymentPolicy.PREPAY_NONE, label: "No Prepayment" },
	{ value: EPrepaymentPolicy.PREPAY_50, label: "50% Deposit" },
	{ value: EPrepaymentPolicy.PREPAY_100, label: "100% Full" },
];

/**
 * Styled badge for policy values.
 */
const PolicyValueChip = ({ label, color = "primary" }: { label: string | undefined; color?: "primary" | "success" | "warning" }) => (
	<Box
		sx={{
			display: "inline-flex",
			alignItems: "center",
			px: 1.5,
			py: 0.5,
			borderRadius: "8px",
			bgcolor: (theme) => alpha(theme.palette[color].main, 0.08),
			border: "1px solid",
			borderColor: (theme) => alpha(theme.palette[color].main, 0.15),
			mt: 0.5,
		}}
	>
		<Typography variant="body2" sx={{ fontWeight: 700, color: `${color}.main`, fontSize: "0.85rem" }}>
			{label || "Not set"}
		</Typography>
	</Box>
);

/**
 * Styled status indicator for House Rules.
 */
const HouseRuleStatus = ({ icon: Icon, label, falseLabel, active }: { icon: typeof Pets; label: string; falseLabel: string; active: boolean }) => (
	<Box
		sx={{
			display: "flex",
			alignItems: "center",
			gap: 1.5,
			p: 1.5,
			borderRadius: "12px",
			bgcolor: active ? "rgba(76, 175, 80, 0.04)" : "rgba(244, 67, 54, 0.04)",
			border: "1px solid",
			borderColor: active ? "rgba(76, 175, 80, 0.1)" : "rgba(244, 67, 54, 0.1)",
		}}
	>
		<Icon sx={{ fontSize: "1.2rem", color: active ? "success.main" : "error.main", opacity: active ? 1 : 0.7 }} />
		<Box flex={1}>
			<Typography variant="body2" sx={{ fontWeight: 600, color: active ? "text.primary" : "text.disabled", fontSize: "0.85rem" }}>
				{active ? label : falseLabel}
			</Typography>
		</Box>
		{active ? (
			<CheckCircleOutline sx={{ fontSize: "1rem", color: "success.main" }} />
		) : (
			<CancelOutlined sx={{ fontSize: "1rem", color: "error.main", opacity: 0.5 }} />
		)}
	</Box>
);

/**
 * Sub-component for rendering the read-only policy view.
 */
const PolicyReadView = ({ initialPolicy }: { initialPolicy: UpdatePolicyDTO }) => (
	<Stack spacing={4}>
		<Grid container spacing={3}>
			{/* Column 1: Arrival & Departure */}
			<Grid size={{ xs: 12, md: 4 }}>
				<Box sx={{ height: "100%", p: 2.5, borderRadius: "16px", bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
					<FieldLabel icon={<AccessTime />}>Arrival & Departure</FieldLabel>
					<Stack spacing={2} mt={1.5}>
						<Box>
							<Typography variant="caption" color="text.disabled" sx={{ display: "block", mb: 0.5, fontWeight: 600 }}>
								CHECK-IN
							</Typography>
							<PolicyValueChip label={initialPolicy.checkInTime} />
						</Box>
						<Box>
							<Typography variant="caption" color="text.disabled" sx={{ display: "block", mb: 0.5, fontWeight: 600 }}>
								CHECK-OUT
							</Typography>
							<PolicyValueChip label={initialPolicy.checkOutTime} color="warning" />
						</Box>
					</Stack>
				</Box>
			</Grid>

			{/* Column 2: Booking Policies */}
			<Grid size={{ xs: 12, md: 4 }}>
				<Box sx={{ height: "100%", p: 2.5, borderRadius: "16px", bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
					<FieldLabel icon={<Security />}>Booking Policies</FieldLabel>
					<Stack spacing={2} mt={1.5}>
						<Box>
							<Typography variant="caption" color="text.disabled" sx={{ display: "block", mb: 0.5, fontWeight: 600 }}>
								CANCELLATION
							</Typography>
							<PolicyValueChip label={CANCELLATION_OPTIONS.find((opt) => opt.value === initialPolicy.cancellationPolicy)?.label} />
							{initialPolicy.cancellationDescription && (
								<Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block", fontStyle: "italic", lineHeight: 1.4 }}>
									"{initialPolicy.cancellationDescription}"
								</Typography>
							)}
						</Box>
						<Box>
							<Typography variant="caption" color="text.disabled" sx={{ display: "block", mb: 0.5, fontWeight: 600 }}>
								PREPAYMENT
							</Typography>
							<PolicyValueChip label={PREPAYMENT_OPTIONS.find((opt) => opt.value === initialPolicy.prepaymentPolicy)?.label} color="success" />
						</Box>
					</Stack>
				</Box>
			</Grid>

			{/* Column 3: House Rules */}
			<Grid size={{ xs: 12, md: 4 }}>
				<Box sx={{ height: "100%", p: 2.5, borderRadius: "16px", bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
					<FieldLabel icon={<FactCheck />}>Basic House Rules</FieldLabel>
					<Stack spacing={1.5} mt={1.5}>
						<HouseRuleStatus icon={Pets} label="Pets Allowed" falseLabel="Pets Not Allowed" active={!!initialPolicy.allowsPets} />
						<HouseRuleStatus icon={SmokingRooms} label="Smoking Allowed" falseLabel="No Smoking" active={!!initialPolicy.allowsSmoking} />
						<HouseRuleStatus icon={MusicNote} label="Parties Allowed" falseLabel="No Parties" active={!!initialPolicy.allowsParties} />
					</Stack>
				</Box>
			</Grid>
		</Grid>

		{/* Bottom Section: Quiet Hours & Additional Rules */}
		<Box
			sx={{
				p: 3,
				borderRadius: "16px",
				bgcolor: "rgba(255,255,255,0.015)",
				border: "1px solid rgba(255,255,255,0.04)",
				position: "relative",
				overflow: "hidden",
			}}
		>
			<Grid container spacing={4}>
				<Grid size={{ xs: 12, md: 4 }}>
					<FieldLabel icon={<NotificationsActive />}>Quiet Hours</FieldLabel>
					{initialPolicy.quietHoursStart || initialPolicy.quietHoursEnd ? (
						<Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
							<Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main", letterSpacing: "0.05em" }}>
								{initialPolicy.quietHoursStart} — {initialPolicy.quietHoursEnd}
							</Typography>
						</Box>
					) : (
						<Typography variant="body2" color="text.disabled" sx={{ fontStyle: "italic" }}>
							No quiet hours specified
						</Typography>
					)}
				</Grid>

				<Grid size={{ xs: 12, md: 8 }}>
					<FieldLabel icon={<ListAlt />}>Additional Rules & Notes</FieldLabel>
					<Typography
						variant="body2"
						sx={{
							mt: 1,
							color: initialPolicy.additionalRules ? "text.secondary" : "text.disabled",
							lineHeight: 1.8,
							whiteSpace: "pre-line",
							fontSize: "0.9rem",
							fontStyle: initialPolicy.additionalRules ? "normal" : "italic",
						}}
					>
						{initialPolicy.additionalRules || "No additional rules have been specified for this accommodation."}
					</Typography>
				</Grid>
			</Grid>
		</Box>
	</Stack>
);

/**
 * Sub-component for rendering the policy edit form.
 */
const PolicyEditForm = ({ control }: { control: Control<UpdatePolicyDTO> }) => (
	<Box display="flex" flexDirection="column" gap={4}>
		{/* Time Section */}
		<Box>
			<Typography variant="subtitle2" fontWeight={700} color="primary.main" mb={2} sx={{ fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
				Arrival & Departure
			</Typography>
			<Grid container spacing={2}>
				<Grid size={{ xs: 12, sm: 6 }}>
					<Controller
						name="checkInTime"
						control={control}
						render={({ field }) => (
							<TextField {...field} label="Check-in Time" type="time" fullWidth size="small" sx={editFieldSx} slotProps={{ inputLabel: { shrink: true } }} />
						)}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6 }}>
					<Controller
						name="checkOutTime"
						control={control}
						render={({ field }) => (
							<TextField {...field} label="Check-out Time" type="time" fullWidth size="small" sx={editFieldSx} slotProps={{ inputLabel: { shrink: true } }} />
						)}
					/>
				</Grid>
			</Grid>
		</Box>

		<Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />

		{/* Policy Section */}
		<Box>
			<Typography variant="subtitle2" fontWeight={700} color="primary.main" mb={2} sx={{ fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
				Booking Policies
			</Typography>
			<Grid container spacing={2}>
				<Grid size={{ xs: 12, sm: 6 }}>
					<Controller
						name="prepaymentPolicy"
						control={control}
						render={({ field }) => (
							<TextField {...field} select label="Prepayment Policy" fullWidth size="small" sx={editFieldSx}>
								{PREPAYMENT_OPTIONS.map((opt) => (
									<MenuItem key={opt.value} value={opt.value}>
										{opt.label}
									</MenuItem>
								))}
							</TextField>
						)}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6 }}>
					<Controller
						name="cancellationPolicy"
						control={control}
						render={({ field }) => (
							<TextField {...field} select label="Cancellation Policy" fullWidth size="small" sx={editFieldSx}>
								{CANCELLATION_OPTIONS.map((opt) => (
									<MenuItem key={opt.value} value={opt.value}>
										{opt.label}
									</MenuItem>
								))}
							</TextField>
						)}
					/>
				</Grid>
				<Grid size={{ xs: 12 }}>
					<Controller
						name="cancellationDescription"
						control={control}
						render={({ field }) => (
							<TextField {...field} label="Cancellation Description" multiline rows={2} fullWidth size="small" sx={editFieldSx} placeholder="Enter details about cancellation..." />
						)}
					/>
				</Grid>
			</Grid>
		</Box>

		<Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />

		{/* House Rules Section */}
		<Box>
			<Typography variant="subtitle2" fontWeight={700} color="primary.main" mb={2} sx={{ fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
				House Rules
			</Typography>
			<Grid container spacing={2} mb={2}>
				<Grid size={{ xs: 12, sm: 4 }}>
					<Controller
						name="allowsPets"
						control={control}
						render={({ field }) => (
							<FormControlLabel
								control={<Switch checked={field.value} onChange={field.onChange} size="small" color="primary" />}
								label={<Typography variant="body2">Allows Pets</Typography>}
							/>
						)}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 4 }}>
					<Controller
						name="allowsSmoking"
						control={control}
						render={({ field }) => (
							<FormControlLabel
								control={<Switch checked={field.value} onChange={field.onChange} size="small" color="primary" />}
								label={<Typography variant="body2">Allows Smoking</Typography>}
							/>
						)}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 4 }}>
					<Controller
						name="allowsParties"
						control={control}
						render={({ field }) => (
							<FormControlLabel
								control={<Switch checked={field.value} onChange={field.onChange} size="small" color="primary" />}
								label={<Typography variant="body2">Allows Parties</Typography>}
							/>
						)}
					/>
				</Grid>
			</Grid>

			<Grid container spacing={2} mb={2}>
				<Grid size={{ xs: 12, sm: 6 }}>
					<Controller
						name="quietHoursStart"
						control={control}
						render={({ field }) => (
							<TextField {...field} label="Quiet Hours Start" type="time" fullWidth size="small" sx={editFieldSx} slotProps={{ inputLabel: { shrink: true } }} />
						)}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6 }}>
					<Controller
						name="quietHoursEnd"
						control={control}
						render={({ field }) => (
							<TextField {...field} label="Quiet Hours End" type="time" fullWidth size="small" sx={editFieldSx} slotProps={{ inputLabel: { shrink: true } }} />
						)}
					/>
				</Grid>
			</Grid>

			<Controller
				name="additionalRules"
				control={control}
				render={({ field }) => (
					<TextField {...field} label="Additional Rules" multiline rows={3} fullWidth size="small" sx={editFieldSx} placeholder="e.g. Please take off shoes inside..." />
				)}
			/>
		</Box>
	</Box>
);

export const ManagePolicyCard = ({ accommodationId, accommodationData }: Props) => {
	const queryClient = useQueryClient();
	const { pushNotification } = usePushNotificationContext();
	const { openModal, closeModal } = useModalContext();
	const { mutate: updateMutate, isPending } = useUpdatePolicy(accommodationId);

	const [isEditing, setIsEditing] = useState(false);

	const initialPolicy: UpdatePolicyDTO = useMemo(
		() =>
			accommodationData.policy || {
				checkInTime: "14:00",
				checkOutTime: "12:00",
				prepaymentPolicy: EPrepaymentPolicy.PREPAY_NONE,
				cancellationPolicy: ECancellationPolicy.CANCEL_24H,
				allowsPets: false,
				allowsSmoking: false,
				allowsParties: false,
				quietHoursStart: "22:00",
				quietHoursEnd: "06:00",
				cancellationDescription: "",
				additionalRules: "",
			},
		[accommodationData.policy]
	);

	const {
		handleSubmit,
		control,
		reset,
		formState: { isDirty },
	} = useForm<UpdatePolicyDTO>({
		defaultValues: initialPolicy,
		mode: "onChange",
	});

	useEffect(() => {
		reset(initialPolicy);
	}, [initialPolicy, reset]);

	const executeSave = (values: UpdatePolicyDTO) => {
		updateMutate(values, {
			onSuccess: () => {
				pushNotification("Policy updated successfully!", "success");
				queryClient.invalidateQueries({ queryKey: ["accommodationManage", accommodationId] });
				setIsEditing(false);
			},
			onError: () => pushNotification("Failed to update policy. Please try again.", "error"),
		});
	};

	const onPendingSave = (values: UpdatePolicyDTO) => {
		openModal(
			<Box sx={{ p: 3, maxWidth: 400 }}>
				<Typography variant="h6" fontWeight={700} mb={1}>
					Save Changes?
				</Typography>
				<Typography variant="body2" color="text.secondary" mb={3}>
					Are you sure you want to update this accommodation's policies?
				</Typography>
				<Box display="flex" justifyContent="flex-end" gap={1.5}>
					<Button variant="text" color="inherit" onClick={closeModal} sx={{ fontWeight: 600 }}>
						Cancel
					</Button>
					<Button
						variant="contained"
						color="primary"
						onClick={() => {
							closeModal();
							executeSave(values);
						}}
						sx={{ fontWeight: 600 }}
					>
						Confirm Save
					</Button>
				</Box>
			</Box>
		);
	};

	const handleCancel = () => {
		if (!isDirty) {
			setIsEditing(false);
			return;
		}
		openModal(
			<Box sx={{ p: 3, maxWidth: 400 }}>
				<Typography variant="h6" fontWeight={700} mb={1}>
					Discard Changes?
				</Typography>
				<Typography variant="body2" color="text.secondary" mb={3}>
					You have unsaved changes. Are you sure you want to discard them?
				</Typography>
				<Box display="flex" justifyContent="flex-end" gap={1.5}>
					<Button variant="text" color="inherit" onClick={closeModal} sx={{ fontWeight: 600 }}>
						Keep Editing
					</Button>
					<Button
						variant="contained"
						color="error"
						onClick={() => {
							reset(initialPolicy);
							setIsEditing(false);
							closeModal();
						}}
						sx={{ fontWeight: 600 }}
					>
						Discard
					</Button>
				</Box>
			</Box>
		);
	};

	return (
		<Paper component="form" onSubmit={handleSubmit(onPendingSave)} elevation={0} sx={getCardSx(isEditing)}>
			<Box sx={getHeaderSx(isEditing)}>
				<Box display="flex" alignItems="center" gap={1.5}>
					<Box
						sx={{
							width: 36,
							height: 36,
							borderRadius: "10px",
							bgcolor: "rgba(255,255,255,0.07)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							flexShrink: 0,
						}}
					>
						<PolicyOutlined sx={{ fontSize: "1.1rem", color: "text.secondary" }} />
					</Box>
					<Box>
						<Typography variant="subtitle1" fontWeight={700} lineHeight={1.2} sx={{ fontSize: "0.95rem" }}>
							Accommodation Policies
						</Typography>
						<Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.75rem" }}>
							Manage cancellation rules and prepayment settings
						</Typography>
					</Box>
				</Box>

				{isEditing ? (
					<Box display="flex" gap={1} alignItems="center">
						<Button
							variant="text"
							size="small"
							color="inherit"
							startIcon={<Close sx={{ fontSize: "0.9rem !important" }} />}
							onClick={handleCancel}
							disabled={isPending}
							sx={{
								borderRadius: "10px",
								fontWeight: 600,
								textTransform: "none",
								fontSize: "0.8rem",
								color: "text.secondary",
								px: 1.5,
								"&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
							}}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							variant="contained"
							size="small"
							color="primary"
							startIcon={isPending ? <CircularProgress size={13} color="inherit" /> : <Check sx={{ fontSize: "0.9rem !important" }} />}
							disabled={isPending || !isDirty}
							sx={{ borderRadius: "10px", fontWeight: 700, textTransform: "none", fontSize: "0.8rem", px: 2, boxShadow: "none", "&:hover": { boxShadow: "none" } }}
						>
							Save changes
						</Button>
					</Box>
				) : (
					<Button
						variant="outlined"
						size="small"
						color="inherit"
						startIcon={<EditOutlined sx={{ fontSize: "0.9rem !important" }} />}
						onClick={() => setIsEditing(true)}
						sx={{
							borderRadius: "10px",
							fontWeight: 600,
							textTransform: "none",
							fontSize: "0.8rem",
							px: 1.75,
							borderColor: "rgba(255,255,255,0.15)",
							color: "text.secondary",
							"&:hover": { borderColor: "rgba(255,255,255,0.4)", bgcolor: "rgba(255,255,255,0.05)", color: "text.primary" },
						}}
					>
						Edit
					</Button>
				)}
			</Box>

			<Box sx={{ px: 3.5, py: 3 }}>{isEditing ? <PolicyEditForm control={control} /> : <PolicyReadView initialPolicy={initialPolicy} />}</Box>
		</Paper>
	);
};
