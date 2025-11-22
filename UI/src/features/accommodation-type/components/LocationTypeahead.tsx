// src/components/LocationTypeahead.tsx
import React, { useEffect, useRef } from "react";
import { Box, Paper, List, ListItemText, ListItemButton, CircularProgress } from "@mui/material";
import { useLocationSearch } from "../contexts/LocationSearchContext";

interface Props {
	onSelect: (location: any) => void;
	open: boolean;
}

export const LocationTypeahead: React.FC<Props> = ({ onSelect, open }) => {
	const { query, results, searchLocations, loading } = useLocationSearch();
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (open) searchLocations();
	}, [open, query]);

	if (!open) return null;

	return (
		<Box ref={containerRef} sx={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 999 }}>
			<Paper elevation={4}>
				{loading ? (
					<Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
						<CircularProgress size={24} />
					</Box>
				) : results.length ? (
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
		</Box>
	);
};
