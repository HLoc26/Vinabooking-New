import { Cancel, Edit, Save } from "@mui/icons-material";
import { Box, Button, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import useUserContextProvider from "../../../context/UserContext/hook";
import { MuiTelInput } from "mui-tel-input";

const ProfileUpdateForm: React.FC = () => {
	const [editing, setEditing] = useState<boolean>(false);
	const { userInfo } = useUserContextProvider();

	return (
		<>
			<Box>
				<Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
					<Typography variant="h6">Account Information</Typography>
					{!editing ? (
						<Button startIcon={<Edit />} onClick={() => setEditing(true)}>
							Edit
						</Button>
					) : (
						<Stack direction="row" spacing={1}>
							<Button
								startIcon={<Cancel />}
								onClick={() => {
									setEditing(false);
								}}
							>
								Cancel
							</Button>
							<Button variant="contained" startIcon={<Save />} onClick={() => setEditing(false)}>
								Save
							</Button>
						</Stack>
					)}
				</Box>
				<Stack>
					<Stack direction={"row"} spacing={3}>
						<TextField //
							fullWidth
							margin="normal"
							label="Full Name"
							disabled={!editing}
							value={userInfo?.name || ""}
						/>
						<MuiTelInput //
							fullWidth
							margin="normal"
							label="Phone Number"
							disabled={!editing}
							value={userInfo?.phone || ""}
						/>
					</Stack>
					<Tooltip title="Editing your email is not allowed." placement="left" arrow>
						<TextField //
							fullWidth
							margin="normal"
							label="Email"
							disabled
							value={userInfo?.email || ""}
						/>
					</Tooltip>
				</Stack>
			</Box>
		</>
	);
};

export default ProfileUpdateForm;
