import React from "react";
import { Box, Chip, Paper, Typography } from "@mui/material";
import { Close } from "@mui/icons-material";

export interface ActiveFilter {
	key: string;
	label: string;
	value: string | number | string[];
}

interface ActiveFiltersBarProps {
	filters: ActiveFilter[];
	onRemoveFilter: (key: string) => void;
	onClearAllFilters: () => void;
}

export const ActiveFiltersBar: React.FC<ActiveFiltersBarProps> = ({ filters, onRemoveFilter, onClearAllFilters }) => {
	if (filters.length === 0) return null;

	return (
		<Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
			<Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
				<Typography variant="body2" fontWeight="medium" sx={{ mr: 1 }}>
					Active Filters:
				</Typography>
				{filters.map((filter) => (
					<Chip key={filter.key} label={`${filter.label}: ${filter.value}`} onDelete={() => onRemoveFilter(filter.key)} size="small" color="primary" variant="outlined" />
				))}
				<Chip label="Clear All" onClick={onClearAllFilters} size="small" color="error" variant="outlined" onDelete={onClearAllFilters} deleteIcon={<Close />} />
			</Box>
		</Paper>
	);
};
