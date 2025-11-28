import React from "react";
import { Box, Typography, TextField, MenuItem, ToggleButtonGroup, ToggleButton, Tooltip } from "@mui/material";
import { GridView, ViewList } from "@mui/icons-material";
import type { SortOption } from "../../types/accommodation.types";
import { SORT_OPTIONS } from "../../constants/searchFilters";
import useSearchFromParams from "../../hooks/useSearchFromParams";
import useSearchContext from "../../../../context/SearchContext/hook";

interface ResultsHeaderProps {
	loading: boolean;
	viewMode: "grid" | "list";
	onChangeViewMode: (mode: "grid" | "list") => void;
}

export const ResultsHeader: React.FC<ResultsHeaderProps> = ({ loading, viewMode, onChangeViewMode }) => {
	const { criteria, total } = useSearchFromParams();
	const { handleUpdateSearchCriteria } = useSearchContext();

	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				mb: 3,
				flexWrap: "wrap",
				gap: 2,
			}}
		>
			<Typography variant="h5" fontWeight="bold">
				{`${total} accommodations found`}
			</Typography>

			<Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
				<TextField
					select
					label="Sort by"
					value={criteria.sortBy}
					onChange={(e) => handleUpdateSearchCriteria("sortBy", e.target.value as SortOption)}
					size="small"
					sx={{ minWidth: 200 }}
					disabled={loading}
				>
					{SORT_OPTIONS.map((option) => (
						<MenuItem key={option.value} value={option.value}>
							{option.label}
						</MenuItem>
					))}
				</TextField>

				<ToggleButtonGroup value={viewMode} exclusive onChange={(_e, newMode) => newMode && onChangeViewMode(newMode)} size="small" disabled={loading}>
					<ToggleButton value="grid">
						<Tooltip title="Grid View">
							<GridView />
						</Tooltip>
					</ToggleButton>
					<ToggleButton value="list">
						<Tooltip title="List View">
							<ViewList />
						</Tooltip>
					</ToggleButton>
				</ToggleButtonGroup>
			</Box>
		</Box>
	);
};
