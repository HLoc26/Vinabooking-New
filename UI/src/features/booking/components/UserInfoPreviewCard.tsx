import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import UserInfoItem from "./UserInfoItem";
import { EmailOutlined, PersonOutline, PhoneOutlined } from "@mui/icons-material";
import type { UserDto } from "../../user/types/UserDto";

type UserInfoPreviewCardProps = {
	userInfo: UserDto;
	isEditing: boolean;
	handleToggleEdit: () => void;
	handleUserInfoUpdate: (field: keyof UserDto, value: string) => void;
};

const UserInfoPreviewCard: React.FC<UserInfoPreviewCardProps> = ({ userInfo, isEditing, handleToggleEdit, handleUserInfoUpdate: handleUserInfoChange }) => {
	return (
		<Card>
			<CardContent>
				<Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
					<Typography variant="h6">User Information</Typography>
					<Button size="small" onClick={handleToggleEdit} sx={{ color: "warning.main" }}>
						{isEditing ? "Done" : "Edit"}
					</Button>
				</Box>

				<UserInfoItem //
					icon={<PersonOutline />}
					onChange={(value) => handleUserInfoChange("name", value)}
					label="Full Name"
					value={userInfo.name}
					isEditing={isEditing}
				/>
				<UserInfoItem //
					icon={<EmailOutlined />}
					onChange={(value) => handleUserInfoChange("email", value)}
					label="Email Address"
					value={userInfo.email}
					isEditing={isEditing}
				/>
				<UserInfoItem //
					icon={<PhoneOutlined />}
					onChange={(value) => handleUserInfoChange("phone", value)}
					label="Phone Number"
					value={userInfo.phone ?? ""}
					isEditing={isEditing}
					isPhone
				/>
			</CardContent>
		</Card>
	);
};

export default UserInfoPreviewCard;
