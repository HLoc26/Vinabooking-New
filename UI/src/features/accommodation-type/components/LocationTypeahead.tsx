// src/components/LocationTypeahead.tsx
import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { Box, Paper, List, ListItemText, ListItemButton, CircularProgress } from "@mui/material";
import { useLocationSearch, type Location } from "../contexts/LocationSearchContext";

export interface Props {
	onSelect: (location: Location) => void;
	open: boolean;
	anchorEl: React.RefObject<HTMLDivElement>;
}

export const LocationTypeahead: React.FC<Props> = ({ onSelect, open, anchorEl }) => {
	const { query, results, searchLocations, loading } = useLocationSearch();

	// Fetch results when opened or when query changes
	useEffect(() => {
		if (open && query.trim().length > 0) searchLocations();
	}, [open, query]);

	// If menu is closed or no anchor element → render nothing
	if (!open || !anchorEl?.current) return null;

	const rect = anchorEl.current.getBoundingClientRect();

	// Don't render anything if user didn't type
	if (query.trim().length === 0) return null;

	return ReactDOM.createPortal(
		<Box
			sx={{
				position: "absolute",
				top: rect.bottom + window.scrollY,
				left: rect.left + window.scrollX,
				width: rect.width,
				zIndex: 2000,
			}}
		>
			<Paper elevation={4}>
				{loading ? (
					<Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
						<CircularProgress size={24} />
					</Box>
				) : results?.length > 0 ? (
					<List>
						{results.map((loc) => (
							<ListItemButton key={loc.id} onClick={() => onSelect(loc)}>
								<ListItemText primary={loc.name} secondary={loc.type} />
							</ListItemButton>
						))}
					</List>
				) : (
					<Box sx={{ p: 2, textAlign: "center" }}>No results</Box>
				)}
			</Paper>
		</Box>,
		document.body
	);
};
