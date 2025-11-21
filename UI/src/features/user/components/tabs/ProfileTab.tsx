import { Divider, Stack } from "@mui/material";
import ProfileAvatar from "../ProfileAvatar";
import ProfileUpdateForm from "../ProfileUpdateForm";

const ProfileTab: React.FC = () => {
	return (
		<Stack spacing={3}>
			<ProfileAvatar />
			<Divider />

			<ProfileUpdateForm />
		</Stack>
	);
};

export default ProfileTab;
