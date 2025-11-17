import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { MuiTelInput } from "mui-tel-input";
import type { UserInfo } from "../services/types/UserInfo";

type UserInfoPreviewCardProps = {
	userInfo: UserInfo;
	isEditing: boolean;
	showPhoneField: boolean;
	handleToggleEdit: () => void;
	handlePhoneChange: (value: string) => void;
};

const UserInfoPreviewCard: React.FC<UserInfoPreviewCardProps> = ({ userInfo, isEditing, showPhoneField, handleToggleEdit, handlePhoneChange }) => {
	return (
		<Card>
			<CardContent>
				<Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
					<Typography variant="h6">User Information</Typography>
					<Button size="small" onClick={handleToggleEdit} sx={{ color: "warning.main" }}>
						{isEditing ? "Done" : "Edit"}
					</Button>
				</Box>

				<Typography sx={{ mb: 1 }}>
					<strong>Name:</strong> {userInfo.name}
				</Typography>
				<Typography sx={{ mb: 1 }}>
					<strong>Email:</strong> {userInfo.email}
				</Typography>

				<Box minHeight={56} display="flex" alignItems="center">
					{isEditing ? (
						<MuiTelInput fullWidth label="Phone" value={userInfo.phone} onChange={handlePhoneChange} size="small" />
					) : (
						showPhoneField && (
							<Typography>
								<strong>Phone:</strong> {userInfo.phone}
							</Typography>
						)
					)}
				</Box>
			</CardContent>
		</Card>
	);
};

export default UserInfoPreviewCard;
