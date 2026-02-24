import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box, Typography, TextField, MenuItem, ToggleButtonGroup, ToggleButton, Tooltip } from "@mui/material";
import { GridView, ViewList } from "@mui/icons-material";

// Types & Constants
import type { SortOption } from "../../types/accommodation.types";
import { SORT_OPTIONS } from "../../constants/searchFilters";
import type { RootState } from "../../../../app/store";

interface ResultsHeaderProps {
	total: number;
	loading: boolean;
	viewMode: "grid" | "list";
	onChangeViewMode: (mode: "grid" | "list") => void;
}

export const ResultsHeader: React.FC<ResultsHeaderProps> = ({ total, loading, viewMode, onChangeViewMode }) => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	// Get current value from redux for UI
	const currentSort = useSelector((state: RootState) => state.search.sortBy);

	const handleUpdateSort = (newSortBy: SortOption) => {
		const params = new URLSearchParams(searchParams);
		params.set("sortBy", newSortBy);
		params.set("page", "1");
		navigate(`/search?${params.toString()}`);
		window.scrollTo(0, 0);
	};

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
			<Typography variant="h6" fontWeight="bold" color="text.primary">
				{loading ? "Searching..." : `${total} accommodations found`}
			</Typography>

			<Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
				<TextField
					select
					label="Sort by"
					// Fallback về 'recommended' nếu Redux chưa kịp load
					value={currentSort || "recommended"}
					onChange={(e) => handleUpdateSort(e.target.value as SortOption)}
					size="small"
					sx={{ minWidth: 200 }}
					disabled={loading}
					variant="outlined"
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
							<GridView fontSize="small" />
						</Tooltip>
					</ToggleButton>
					<ToggleButton value="list">
						<Tooltip title="List View">
							<ViewList fontSize="small" />
						</Tooltip>
					</ToggleButton>
				</ToggleButtonGroup>
			</Box>
		</Box>
	);
};
