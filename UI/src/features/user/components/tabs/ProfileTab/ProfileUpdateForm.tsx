import { Cancel, Edit, Save } from "@mui/icons-material";
import { Box, Button, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import useUserContextProvider from "../../../../../context/UserContext/hook";
import { MuiTelInput } from "mui-tel-input";
import type { UserDto } from "../../../../../types/UserDto";
import { usePushNotificationContext } from "../../../../../context/PushNotification/hook";

const ProfileUpdateForm: React.FC = () => {
	const [editing, setEditing] = useState(false);
	const { userInfo, updateUserInfo } = useUserContextProvider();
	const { pushNotification } = usePushNotificationContext();

	const [draft, setDraft] = useState<UserDto | null>(null);

	// When turn off edit or userInfo changes, sync draft
	useEffect(() => {
		if (!editing) setDraft(userInfo || null);
	}, [editing, userInfo]);

	const handleSave = async () => {
		if (!draft) return;

		if ((draft.name || "").length > 50) {
			pushNotification("Name is too long", "error");
			return;
		}

		const invalidNameRegex = /[/!@#,\p{Extended_Pictographic}]/u;
		if (invalidNameRegex.test(draft.name || "")) {
			pushNotification("Name contains invalid characters", "error");
			return;
		}

		try {
			await updateUserInfo({ name: draft.name, phone: draft.phone });
			pushNotification("Profile updated successfully", "success");
			setEditing(false);
		} catch (error) {
			const err = error as Error;
			pushNotification(err.message || "Failed to update profile", "error");
		}
	};

	const handleCancel = () => {
		setDraft(userInfo || null);
		setEditing(false);
	};

	return (
		<Box>
			<Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
				<Typography variant="h6">Account Information</Typography>

				{!editing ? (
					<Button
						startIcon={<Edit />}
						onClick={() => {
							setDraft(userInfo || null);
							setEditing(true);
						}}
					>
						Edit
					</Button>
				) : (
					<Stack direction="row" spacing={1}>
						<Button startIcon={<Cancel />} onClick={handleCancel}>
							Cancel
						</Button>
						<Button variant="contained" startIcon={<Save />} onClick={handleSave}>
							Save
						</Button>
					</Stack>
				)}
			</Box>

			<Stack>
				<Stack direction="row" spacing={3}>
					<TextField
						fullWidth
						margin="normal"
						label="Full Name"
						disabled={!editing}
						value={draft?.name || ""}
						onChange={(e) => setDraft((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
					/>

					<MuiTelInput
						fullWidth
						margin="normal"
						label="Phone Number"
						disabled={!editing}
						value={draft?.phone || ""}
						onChange={(value) => setDraft((prev) => (prev ? { ...prev, phone: value } : prev))}
					/>
				</Stack>

				<Tooltip title="Editing your email is not allowed." placement="left" arrow>
					<TextField fullWidth margin="normal" label="Email" disabled value={draft?.email || ""} />
				</Tooltip>
			</Stack>
		</Box>
	);
};

export default ProfileUpdateForm;
