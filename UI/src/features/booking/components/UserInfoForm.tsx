import React, { useState } from "react";
import { Box, TextField, IconButton, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import type { BookingDto } from "../services/types/BookingDto";

interface Props {
	user: BookingDto["user"];
}

export const UserInfoForm: React.FC<Props> = ({ user }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [phone, setPhone] = useState(user.phone);

	return (
		<Box p={2} borderRadius={2} boxShadow={2} mb={3}>
			<Box display="flex" justifyContent="space-between" alignItems="center">
				<Typography variant="h6">User Information</Typography>
				<IconButton onClick={() => setIsEditing(!isEditing)}>
					<EditIcon />
				</IconButton>
			</Box>

			<TextField label="Full Name" value={user.name} fullWidth disabled required margin="normal" />
			<TextField label="Email" value={user.email} fullWidth disabled margin="normal" />
			<TextField label="Phone Number" value={phone} fullWidth disabled={!isEditing} margin="normal" onChange={(e) => setPhone(e.target.value)} />
		</Box>
	);
};
