import { useState } from "react";
import { Box, Typography, Button, Paper, CircularProgress } from "@mui/material";
import { EditOutlined, Close, Check, EventAvailableRounded } from "@mui/icons-material";
import { useQueryClient } from "@tanstack/react-query";

import { useUpdateAccommodationPricing } from "../../../hooks/useUpdateAccommodationPricing";
import { useHolidayCatalog } from "../../../hooks/useHolidayCatalog";
import { usePushNotificationContext } from "../../../../../context/PushNotification/hook";
import useModalContext from "../../../../../context/ModalContext/hook";
import { getCardSx, getHeaderSx, FieldLabel, FieldValue } from "../shared/CardSharedUI";
import OwnerHolidayForm from "../../Settings/OwnerHolidayForm";
import type { HolidayOptIn } from "../../../types/pricing.types";

interface Props {
	accommodationId: string;
	initialOptIns: HolidayOptIn[];
}

export const ManageHolidayPricingCard = ({ accommodationId, initialOptIns }: Props) => {
	const queryClient = useQueryClient();
	const { pushNotification } = usePushNotificationContext();
	const { openModal, closeModal } = useModalContext();
	const { mutate: updateMutate, isPending } = useUpdateAccommodationPricing(accommodationId);
	const { data: catalog, isLoading: catalogLoading } = useHolidayCatalog();

	const [isEditing, setIsEditing] = useState(false);
	const [localOptIns, setLocalOptIns] = useState<HolidayOptIn[]>(initialOptIns);

	const handleCancel = () => {
		setLocalOptIns(initialOptIns);
		setIsEditing(false);
	};

	const executeSave = () => {
		updateMutate(
			{ holidayOptIns: localOptIns },
			{
				onSuccess: () => {
					pushNotification("Holiday surcharges updated!", "success");
					queryClient.invalidateQueries({ queryKey: ["accommodationManage", accommodationId] });
					setIsEditing(false);
				},
				onError: () => pushNotification("Failed to update holiday pricing.", "error"),
			}
		);
	};

	const onPendingSave = () => {
		openModal(
			<Box sx={{ p: 3, maxWidth: 400 }}>
				<Typography variant="h6" fontWeight={700} mb={1}>
					Save Holiday Pricing?
				</Typography>
				<Typography variant="body2" color="text.secondary" mb={3}>
					Selected holidays will use these multipliers for all rooms in this accommodation.
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

	if (catalogLoading) {
		return (
			<Paper elevation={0} sx={{ p: 4, display: "flex", justifyContent: "center" }}>
				<CircularProgress />
			</Paper>
		);
	}

	return (
		<Paper elevation={0} sx={getCardSx(isEditing)}>
			<Box sx={getHeaderSx(isEditing)}>
				<Box display="flex" alignItems="center" gap={1.5}>
					<Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
						<EventAvailableRounded sx={{ fontSize: "1.1rem", color: "text.secondary" }} />
					</Box>
					<Box>
						<Typography variant="subtitle1" fontWeight={700} lineHeight={1.2} sx={{ fontSize: "0.95rem" }}>
							Holiday Pricing
						</Typography>
						<Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.75rem" }}>
							Custom price multipliers for peak holiday dates
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
					<OwnerHolidayForm
						catalog={catalog ?? []}
						value={localOptIns}
						onChange={setLocalOptIns}
						hideSubmit
						disabled={isPending}
					/>
				) : (
					<Box>
						<FieldLabel>Active Holidays</FieldLabel>
						{initialOptIns.length > 0 ? (
							<Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>
								{initialOptIns.map((opt) => {
									const holiday = catalog?.find((h) => h.code === opt.holidayCode);
									return (
										<Box
											key={opt.holidayCode}
											sx={{
												p: 1.5,
												bgcolor: "rgba(255,255,255,0.02)",
												borderRadius: 2,
												border: "1px solid rgba(255,255,255,0.05)",
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center"
											}}
										>
											<Box>
												<Typography variant="body2" fontWeight={600}>
													{holiday?.name || opt.holidayCode}
												</Typography>
												{(opt.preDays > 0 || opt.postDays > 0) && (
													<Typography variant="caption" color="text.secondary">
														Window: +{opt.preDays} days before / +{opt.postDays} days after
													</Typography>
												)}
											</Box>
											<Typography variant="body2" fontWeight={700} color="primary.main">
												{Number(opt.priceMultiplier).toFixed(1)}x
											</Typography>
										</Box>
									);
								})}
							</Box>
						) : (
							<FieldValue>No holidays configured. Standard rates will apply year-round.</FieldValue>
						)}
					</Box>
				)}
			</Box>
		</Paper>
	);
};
