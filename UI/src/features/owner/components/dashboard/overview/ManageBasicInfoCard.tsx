import { useState, useEffect } from "react";
import { Box, TextField, CircularProgress, Typography, Button, Paper, Divider, Chip, MenuItem, Grid } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { EditOutlined, Close, Check, HotelOutlined, DescriptionOutlined, CategoryOutlined, KeyOutlined } from "@mui/icons-material";

import { useUpdateBasicAccom } from "../../../hooks/useUpdateBasicAccom";
import { usePushNotificationContext } from "../../../../../context/PushNotification/hook";
import useModalContext from "../../../../../context/ModalContext/hook";
import { ERentalType, EAccommodationType } from "../../../../accommodation/types/accommodation.types";
import { FieldLabel, FieldValue, editFieldSx, getCardSx, getHeaderSx } from "../shared/CardSharedUI";

interface BasicInfoFormValues {
	name: string;
	description: string;
	type: string;
	rentalType: ERentalType;
}

interface Props {
	accommodationId: string;
	initialData: BasicInfoFormValues;
}

const LIMIT = 150;

export const ManageBasicInfoCard = ({ accommodationId, initialData }: Props) => {
	const queryClient = useQueryClient();
	const { pushNotification } = usePushNotificationContext();
	const { openModal, closeModal } = useModalContext();
	const { mutate: updateMutate, isPending } = useUpdateBasicAccom(accommodationId);

	const [isEditing, setIsEditing] = useState(false);

	const {
		handleSubmit,
		control,
		watch,
		reset,
		formState: { isDirty },
	} = useForm<BasicInfoFormValues>({
		defaultValues: initialData,
		mode: "onChange",
	});

	useEffect(() => {
		reset(initialData);
	}, [initialData, reset]);

	const watchedDescription = watch("description");
	const currentCount = watchedDescription?.length || 0;
	const isOverLimit = currentCount > LIMIT;

	const executeSave = (values: BasicInfoFormValues) => {
		updateMutate(values, {
			onSuccess: () => {
				pushNotification("Information updated successfully!", "success");
				queryClient.invalidateQueries({ queryKey: ["accommodationManage", accommodationId] });
				setIsEditing(false);
			},
			onError: () => pushNotification("Failed to update info. Please try again.", "error"),
		});
	};

	const onPendingSave = (values: BasicInfoFormValues) => {
		if (isOverLimit) {
			pushNotification(`Description exceeds the ${LIMIT} characters limit.`, "error");
			return;
		}

		openModal(
			<Box sx={{ p: 3, maxWidth: 400 }}>
				<Typography variant="h6" fontWeight={700} mb={1}>
					Save Changes?
				</Typography>
				<Typography variant="body2" color="text.secondary" mb={3}>
					Are you sure you want to update this accommodation's details?
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
							reset(initialData);
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
					<Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
						<HotelOutlined sx={{ fontSize: "1.1rem", color: "text.secondary" }} />
					</Box>
					<Box>
						<Typography variant="subtitle1" fontWeight={700} lineHeight={1.2} sx={{ fontSize: "0.95rem" }}>
							Basic Information
						</Typography>
						<Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.75rem" }}>
							Core details visible to guests
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

			<Box sx={{ px: 3.5, py: 3 }}>
				{isEditing ? (
					<Box display="flex" flexDirection="column" gap={2.5}>
						<Controller
							name="name"
							control={control}
							rules={{ required: true }}
							render={({ field }) => <TextField {...field} label="Accommodation Name" fullWidth disabled={isPending} required size="small" sx={editFieldSx} />}
						/>

						<Grid container spacing={2}>
							<Grid size={{ xs: 12, sm: 6 }}>
								<Controller
									name="rentalType"
									control={control}
									render={({ field }) => (
										<TextField {...field} select label="Rental Type" fullWidth disabled size="small" sx={editFieldSx}>
											{Object.values(ERentalType).map((val) => (
												<MenuItem key={val} value={val}>
													{val.replaceAll("_", " ")}
												</MenuItem>
											))}
										</TextField>
									)}
								/>
							</Grid>
							<Grid size={{ xs: 12, sm: 6 }}>
								<Controller
									name="type"
									control={control}
									rules={{ required: true }}
									render={({ field }) => (
										<TextField {...field} select label="Accommodation Type" fullWidth disabled={isPending} required size="small" sx={editFieldSx}>
											{Object.values(EAccommodationType).map((val) => (
												<MenuItem key={val} value={val}>
													{val.replaceAll("_", " ")}
												</MenuItem>
											))}
										</TextField>
									)}
								/>
							</Grid>
						</Grid>

						<Controller
							name="description"
							control={control}
							rules={{ required: true }}
							render={({ field }) => (
								<TextField
									{...field}
									label="Description"
									multiline
									rows={4}
									fullWidth
									disabled={isPending}
									error={isOverLimit}
									size="small"
									helperText={`${currentCount} / ${LIMIT} characters`}
									slotProps={{ formHelperText: { sx: { textAlign: "right", color: isOverLimit ? "error.main" : "text.disabled" } } }}
									sx={editFieldSx}
								/>
							)}
						/>
					</Box>
				) : (
					<Grid container rowSpacing={3} columnSpacing={4}>
						<Grid size={{ xs: 12, md: 6 }}>
							<FieldLabel icon={<HotelOutlined />}>Accommodation Name</FieldLabel>
							<FieldValue large>{initialData.name}</FieldValue>
						</Grid>

						<Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex", alignItems: "flex-start" }}>
							<Box display="flex" gap={3} flexWrap="wrap">
								<Box>
									<FieldLabel icon={<KeyOutlined />}>Rental Type</FieldLabel>
									<Chip
										label={initialData.rentalType.replaceAll("_", " ")}
										size="small"
										color="primary"
										sx={{ fontWeight: 700, borderRadius: "8px", fontSize: "0.75rem", height: 26, letterSpacing: "0.03em" }}
									/>
								</Box>
								<Box>
									<FieldLabel icon={<CategoryOutlined />}>Property Type</FieldLabel>
									<Chip
										label={initialData.type.replaceAll("_", " ")}
										size="small"
										sx={{ fontWeight: 700, borderRadius: "8px", fontSize: "0.75rem", height: 26, letterSpacing: "0.03em", bgcolor: "rgba(255,255,255,0.1)", color: "text.primary" }}
									/>
								</Box>
							</Box>
						</Grid>

						<Grid size={{ xs: 12 }} sx={{ py: 0 }}>
							<Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
						</Grid>

						<Grid size={{ xs: 12 }}>
							<FieldLabel icon={<DescriptionOutlined />}>Description</FieldLabel>
							<Typography
								variant="body2"
								sx={{
									whiteSpace: "pre-line",
									color: initialData.description ? "text.secondary" : "text.disabled",
									lineHeight: 1.75,
									fontStyle: initialData.description ? "normal" : "italic",
									fontSize: "0.9rem",
									maxWidth: "72ch",
								}}
							>
								{initialData.description || "No description provided yet. Click Edit to add one."}
							</Typography>
						</Grid>
					</Grid>
				)}
			</Box>
		</Paper>
	);
};
