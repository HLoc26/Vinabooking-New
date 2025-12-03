import React from "react";
import { Stack, Typography, IconButton } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";

interface CounterProps {
	label: string;
	value: number;
	onChange: (val: number) => void;
	min?: number;
}

export const Counter: React.FC<CounterProps> = ({ label, value, onChange, min = 0 }) => (
	<Stack direction="row" justifyContent="space-between" alignItems="center" py={1} px={2}>
		<Typography variant="body2" fontWeight={500}>
			{label}
		</Typography>
		<Stack direction="row" spacing={1} alignItems="center">
			<IconButton size="small" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>
				<RemoveIcon fontSize="small" />
			</IconButton>
			<Typography variant="body2" fontWeight="bold" sx={{ minWidth: 20, textAlign: "center" }}>
				{value}
			</Typography>
			<IconButton size="small" onClick={() => onChange(value + 1)}>
				<AddIcon fontSize="small" />
			</IconButton>
		</Stack>
	</Stack>
);
