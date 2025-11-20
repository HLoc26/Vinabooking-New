import { PhotoCamera } from "@mui/icons-material";
import { Avatar, Box, Button, Typography } from "@mui/material";

type ProfileAvatarProps = {
	url: string;
	name: string;
};

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ url, name }) => {
	return (
		<Box display="flex" alignItems="center" gap={3}>
			<Box>
				<Avatar alt={name} src={url} sx={{ width: 120, height: 120 }} />
			</Box>
			<Box>
				<Typography variant="h6">{name}</Typography>
				<Button variant="outlined" component="label" startIcon={<PhotoCamera />}>
					Change avatar
					<input type="file" hidden accept="image/*" />
				</Button>
				<Typography variant="caption" display="block" sx={{ mt: 1, color: "text.secondary" }}>
					JPG, PNG or GIF. Max 10MB.
				</Typography>
			</Box>
		</Box>
	);
};

export default ProfileAvatar;
