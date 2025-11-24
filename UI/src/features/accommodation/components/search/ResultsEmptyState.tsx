import React from "react";
import { Box, Paper, Typography } from "@mui/material";

interface Props {
	onClearAllFilters: () => void;
}

export const ResultsEmptyState: React.FC<Props> = ({ onClearAllFilters }) => {
	return (
		<Paper
			elevation={0}
			sx={{
				p: 8,
				textAlign: "center",
				bgcolor: "transparent",
			}}
		>
			<Typography variant="h6" color="text.secondary" gutterBottom>
				No accommodations found
			</Typography>
			<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
				Try adjusting your filters or search criteria
			</Typography>
			<Box
				onClick={onClearAllFilters}
				sx={{
					display: "inline-block",
					py: 1.5,
					px: 4,
					bgcolor: "primary.main",
					color: "white",
					borderRadius: 1,
					cursor: "pointer",
					transition: "all 0.2s",
					"&:hover": {
						bgcolor: "primary.dark",
					},
				}}
			>
				<Typography variant="body2" fontWeight="medium">
					Clear All Filters
				</Typography>
			</Box>
		</Paper>
	);
};
