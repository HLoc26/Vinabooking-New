import React from "react";
import { ToggleButton, ToggleButtonGroup, Box, Typography } from "@mui/material";
import type { EUserType } from "../types/UserDto";

interface Props {
    value: EUserType;
    onChange: (v: EUserType) => void;
}

const UserSwitcher: React.FC<Props> = ({ value, onChange }) => {
	return (
		<Box display="flex" alignItems="center" gap={2} mb={2}>
			<Typography variant="body2">You are</Typography>
			<ToggleButtonGroup
				color="primary"
				value={value}
				exclusive
				onChange={(_, v) => v && onChange(v as EUserType)}
				size="small"
			>
				<ToggleButton value="TRAVELLER">Traveller</ToggleButton>
				<ToggleButton value="ACCOMMODATION_OWNER">Accommodation Owner</ToggleButton>
			</ToggleButtonGroup>
		</Box>
	);
};

export default UserSwitcher;
