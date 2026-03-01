import { PhotoCamera } from "@mui/icons-material";
import { Avatar, Box, Button, Typography, CircularProgress } from "@mui/material";
import useUserProfileInfo from "../../../hooks/useUserProfileInfo";
import { usePushNotificationContext } from "../../../../../context/PushNotification/hook";
import type { ChangeEvent } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ProfileAvatar: React.FC = () => {
	const { userInfo, currentAvatarUrl, uploadAvatarMutation } = useUserProfileInfo();
	const { pushNotification } = usePushNotificationContext();

	const name = userInfo?.name;
	const isUploading = uploadAvatarMutation.isPending;

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		if (file.size > MAX_FILE_SIZE) {
			pushNotification("File size exceeds 10MB limit. Please choose a smaller image.", "error");
			event.target.value = "";
			return;
		}

		// Gọi mutation upload
		uploadAvatarMutation.mutate(file, {
			onSuccess: () => {
				pushNotification("Avatar updated successfully!", "success");
			},
			onError: (error) => {
				console.error("Upload failed:", error);
				pushNotification("Failed to update avatar. Please try again.", "error");
			},
			onSettled: () => {
				event.target.value = "";
			},
		});
	};

	return (
		<Box display="flex" alignItems="center" gap={3}>
			<Box position="relative" display="inline-flex">
				<Avatar
					alt={name}
					src={currentAvatarUrl}
					sx={{
						width: 120,
						height: 120,
						opacity: isUploading ? 0.5 : 1,
						transition: "opacity 0.2s",
					}}
				/>
				{isUploading && (
					<CircularProgress
						size={40}
						sx={{
							position: "absolute",
							top: "50%",
							left: "50%",
							marginTop: "-20px",
							marginLeft: "-20px",
						}}
					/>
				)}
			</Box>

			<Box>
				<Typography variant="h6">{name}</Typography>
				<Button variant="outlined" component="label" startIcon={<PhotoCamera />} disabled={isUploading}>
					{isUploading ? "Uploading..." : "Change avatar"}
					<input type="file" hidden accept="image/jpeg, image/png, image/gif, image/webp" onChange={handleFileChange} />
				</Button>
				<Typography variant="caption" display="block" sx={{ mt: 1, color: "text.secondary" }}>
					JPG, PNG or GIF. Max 10MB.
				</Typography>
			</Box>
		</Box>
	);
};

export default ProfileAvatar;
