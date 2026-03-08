import { Cancel, Edit, Save } from "@mui/icons-material";
import { Box, Button, Stack, TextField, Tooltip, Typography, Skeleton } from "@mui/material";
import { useEffect, useState } from "react";
import { MuiTelInput } from "mui-tel-input";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { useForm, Controller } from "react-hook-form";
import type { UpdateUserInfoDto } from "../../../types";
import { useUpdateUser } from "../../../hooks/useUpdateUser";

const ProfileUpdateForm: React.FC = () => {
	// UI State for toggling View/Edit mode
	const [isEditing, setIsEditing] = useState(false);

	// 1. Fetch Data (Server State)
	const { userInfo, isLoading } = useUserProfile();

	// 2. Mutation (Update Logic)
	// Assuming useUpdateUserMutation returns { mutate, isPending } based on TanStack Query standards
	const { mutate, isPending } = useUpdateUser();

	// 3. Form Management
	const {
		register,
		handleSubmit,
		reset,
		control, // Needed for MuiTelInput
		formState: { errors },
	} = useForm<UpdateUserInfoDto>();

	// 4. Sync Data: When user data loads, populate the form
	useEffect(() => {
		if (userInfo) {
			reset({
				name: userInfo.name,
				phone: userInfo.phone,
			});
		}
	}, [userInfo, reset]);

	// 5. Handlers
	const onSubmit = (data: UpdateUserInfoDto) => {
		mutate(data, {
			onSuccess: () => {
				setIsEditing(false); // Switch back to view mode on success
			},
		});
	};

	const handleCancel = () => {
		reset(); // Revert form to the last known 'user' data
		setIsEditing(false);
	};

	if (isLoading) {
		return <Skeleton variant="rectangular" height={200} />;
	}

	return (
		<Box component="form" onSubmit={handleSubmit(onSubmit)}>
			<Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
				<Typography variant="h6">Account Information</Typography>

				{!isEditing ? (
					<Button startIcon={<Edit />} onClick={() => setIsEditing(true)}>
						Edit
					</Button>
				) : (
					<Stack direction="row" spacing={1}>
						<Button startIcon={<Cancel />} onClick={handleCancel} disabled={isPending}>
							Cancel
						</Button>
						<Button
							variant="contained"
							startIcon={<Save />}
							type="submit" // Triggers handleSubmit
							disabled={isPending}
						>
							{isPending ? "Saving..." : "Save"}
						</Button>
					</Stack>
				)}
			</Box>

			<Stack spacing={3}>
				<Stack direction="row" spacing={3}>
					{/* Full Name Input */}
					<TextField fullWidth label="Full Name" disabled={!isEditing} error={!!errors.name} helperText={errors.name?.message} {...register("name", { required: "Name is required" })} />

					{/* Phone Input - Uses Controller because MuiTelInput is a controlled component */}
					<Controller
						name="phone"
						control={control}
						rules={{ required: "Phone number is required" }}
						render={({ field, fieldState }) => (
							<MuiTelInput {...field} fullWidth label="Phone Number" disabled={!isEditing} error={!!fieldState.error} helperText={fieldState.error?.message} />
						)}
					/>
				</Stack>

				{/* Email Input - Read Only */}
				<Tooltip title="Editing your email is not allowed." placement="left" arrow>
					<TextField fullWidth label="Email" disabled value={userInfo?.email || ""} />
				</Tooltip>
			</Stack>
		</Box>
	);
};

export default ProfileUpdateForm;
