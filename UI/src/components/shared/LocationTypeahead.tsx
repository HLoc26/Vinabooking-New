// src/components/LocationTypeahead.tsx
import React from "react";
import { Box, Paper, List, ListItemText, ListItemButton, CircularProgress } from "@mui/material";
import useTypeahead from "../../hooks/useTypeahead";

interface Props {
	open: boolean;
	onSelect: (location: { id: string; name: string }) => void;
	keyword: string; // thêm
}

export const LocationTypeahead: React.FC<Props> = ({ onSelect, open, keyword }) => {
	const { results, loading } = useTypeahead(keyword); // dùng keyword từ props

	if (!open) return null;
	if (keyword.trim().length === 0) return null;

	return (
		<Paper
			elevation={8}
			sx={{
				position: "absolute",
				top: "calc(100% + 8px)",
				left: 0,
				right: 0,
				zIndex: 2100,
				maxHeight: 400,
				overflow: "auto",
			}}
		>
			{loading ? (
				<Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
					<CircularProgress size={24} />
				</Box>
			) : results?.length > 0 ? (
				<List sx={{ p: 0 }}>
					{results.map((loc) => (
						<ListItemButton key={loc.id} onClick={() => onSelect(loc)}>
							<ListItemText primary={loc.name} secondary={[loc.address.city, loc.type].filter(Boolean).join(" · ") || null} />
						</ListItemButton>
					))}
				</List>
			) : (
				<Box sx={{ p: 2, textAlign: "center" }}>No results</Box>
			)}
		</Paper>
	);
};
