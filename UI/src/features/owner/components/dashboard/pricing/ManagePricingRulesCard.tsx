import { useState } from "react";
import { Box, Typography, Button, Paper, CircularProgress } from "@mui/material";
import { EditOutlined, Close, Check, AutoGraphRounded } from "@mui/icons-material";
import { useQueryClient } from "@tanstack/react-query";

import { useUpdateAccommodationPricing } from "../../../hooks/useUpdateAccommodationPricing";
import { usePushNotificationContext } from "../../../../../context/PushNotification/hook";
import useModalContext from "../../../../../context/ModalContext/hook";
import { getCardSx, getHeaderSx, FieldLabel, FieldValue } from "../shared/CardSharedUI";
import OwnerSettingsForm from "../../Settings/OwnerSettingsForm";
import type { DynamicPricingSettings } from "../../../types/pricing.types";

interface Props {
	accommodationId: string;
	initialSettings: DynamicPricingSettings | null;
}

export const ManagePricingRulesCard = ({ accommodationId, initialSettings }: Props) => {
	const queryClient = useQueryClient();
	const { pushNotification } = usePushNotificationContext();
	const { openModal, closeModal } = useModalContext();
	const { mutate: updateMutate, isPending } = useUpdateAccommodationPricing(accommodationId);

	const [isEditing, setIsEditing] = useState(false);
	const [localSettings, setLocalSettings] = useState<DynamicPricingSettings | null>(initialSettings);

	const handleCancel = () => {
		setLocalSettings(initialSettings);
		setIsEditing(false);
	};

	const executeSave = () => {
		updateMutate(
			{ dynamicPricingSettings: localSettings },
			{
				onSuccess: () => {
					pushNotification("Pricing rules updated!", "success");
					queryClient.invalidateQueries({ queryKey: ["accommodationManage", accommodationId] });
					setIsEditing(false);
				},
				onError: () => pushNotification("Failed to update pricing rules.", "error"),
			}
		);
	};

	const onPendingSave = () => {
		openModal(
			<Box sx={{ p: 3, maxWidth: 400 }}>
				<Typography variant="h6" fontWeight={700} mb={1}>
					Save Pricing Rules?
				</Typography>
				<Typography variant="body2" color="text.secondary" mb={3}>
					These rules will immediately affect future price calculations for this property.
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
							executeSave();
						}}
						sx={{ fontWeight: 600 }}
					>
						Confirm Save
					</Button>
				</Box>
			</Box>
		);
	};

	return (
		<Paper elevation={0} sx={getCardSx(isEditing)}>
			<Box sx={getHeaderSx(isEditing)}>
				<Box display="flex" alignItems="center" gap={1.5}>
					<Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
						<AutoGraphRounded sx={{ fontSize: "1.1rem", color: "text.secondary" }} />
					</Box>
					<Box>
						<Typography variant="subtitle1" fontWeight={700} lineHeight={1.2} sx={{ fontSize: "0.95rem" }}>
							Dynamic Pricing Rules
						</Typography>
						<Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.75rem" }}>
							Automatic discounts for long stays and early bookings
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
							sx={{ borderRadius: "10px", fontWeight: 600, textTransform: "none", fontSize: "0.8rem", color: "text.secondary" }}
						>
							Cancel
						</Button>
						<Button
							variant="contained"
							size="small"
							color="primary"
							startIcon={isPending ? <CircularProgress size={13} color="inherit" /> : <Check sx={{ fontSize: "0.9rem !important" }} />}
							disabled={isPending}
							onClick={onPendingSave}
							sx={{ borderRadius: "10px", fontWeight: 700, textTransform: "none", fontSize: "0.8rem" }}
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
						sx={{ borderRadius: "10px", fontWeight: 600, textTransform: "none", fontSize: "0.8rem", color: "text.secondary" }}
					>
						Edit
					</Button>
				)}
			</Box>

			<Box sx={{ px: 3.5, py: 3 }}>
				{isEditing ? (
					<OwnerSettingsForm value={localSettings} onChange={setLocalSettings} hideSubmit disabled={isPending} />
				) : (
					<Box display="flex" flexDirection="column" gap={3}>
						<Box>
							<FieldLabel>Long-stay Discount</FieldLabel>
							{initialSettings?.longStayConfig ? (
								<FieldValue>
									<strong>{initialSettings.longStayConfig.discountRate * 100}% off</strong> for stays of <strong>{initialSettings.longStayConfig.thresholdNights} nights</strong> or more.
								</FieldValue>
							) : (
								<FieldValue>Disabled</FieldValue>
							)}
						</Box>
						<Box>
							<FieldLabel>Early-bird Discount</FieldLabel>
							{initialSettings?.earlyBirdConfig ? (
								<FieldValue>
									<strong>{initialSettings.earlyBirdConfig.discountRate * 100}% off</strong> when booked <strong>{initialSettings.earlyBirdConfig.leadDays} days</strong> in advance.
								</FieldValue>
							) : (
								<FieldValue>Disabled</FieldValue>
							)}
						</Box>
					</Box>
				)}
			</Box>
		</Paper>
	);
};
