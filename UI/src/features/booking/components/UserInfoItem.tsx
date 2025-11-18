import { Box, InputAdornment, TextField, Typography } from "@mui/material";
import { MuiTelInput } from "mui-tel-input";

type UserInfoItemProps = {
	icon: React.ReactNode;
	label: string;
	value: string;
	isEditing: boolean;
	onChange: (value: string) => void;
	fieldType?: string;
	isPhone?: boolean; // mới
};

const UserInfoItem: React.FC<UserInfoItemProps> = ({ icon, label, value, isEditing, onChange, fieldType = "text", isPhone = false }) => (
	<Box sx={{ mb: 2 }}>
		{isEditing ? (
			isPhone ? (
				<MuiTelInput //
					fullWidth
					label={label}
					value={value}
					onChange={onChange}
					size="small"
					sx={{
						"& .MuiInputBase-input": {
							padding: "16.5px",
							pl: 0,
						},
					}}
				/>
			) : (
				<TextField
					label={label}
					type={fieldType}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					variant="outlined"
					fullWidth
					InputProps={{
						startAdornment: <InputAdornment position="start">{icon}</InputAdornment>,
					}}
				/>
			)
		) : (
			<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
				<Box sx={{ color: "text.secondary", mt: 0.5 }}>{icon}</Box>
				<Box>
					<Typography variant="caption" color="text.secondary">
						{label}
					</Typography>
					<Typography variant="body1" fontWeight="medium">
						{value}
					</Typography>
				</Box>
			</Box>
		)}
	</Box>
);

export default UserInfoItem;
