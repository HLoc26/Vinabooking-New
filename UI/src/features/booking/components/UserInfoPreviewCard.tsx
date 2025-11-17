import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { MuiTelInput } from "mui-tel-input";
import type { BookingDto } from "../services/types/BookingDto";

type UserInfoPreviewCardProps = {
	booking: BookingDto;
	isEditing: boolean;
	showPhoneField: boolean;
	handleToggleEdit: () => void;
	handlePhoneChange: (value: string) => void;
};

const UserInfoPreviewCard: React.FC<UserInfoPreviewCardProps> = ({ booking, isEditing, showPhoneField, handleToggleEdit, handlePhoneChange }) => {
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
					<strong>Name:</strong> {booking.user.name}
				</Typography>
				<Typography sx={{ mb: 1 }}>
					<strong>Email:</strong> {booking.user.email}
				</Typography>

				<Box minHeight={56} display="flex" alignItems="center">
					{isEditing ? (
						<MuiTelInput fullWidth label="Phone" value={booking.user.phone} onChange={handlePhoneChange} size="small" />
					) : (
						showPhoneField && (
							<Typography>
								<strong>Phone:</strong> {booking.user.phone}
							</Typography>
						)
					)}
				</Box>
			</CardContent>
		</Card>
	);
};

export default UserInfoPreviewCard;
