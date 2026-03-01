import React from "react";
import { Box, Paper, List, ListItemButton, CircularProgress, Typography } from "@mui/material";
import { useLocationSuggestions } from "../../../../hooks/useLocationSuggestions";
import type { AccommodationDetail } from "../../../../types/accommodation.types";

interface Props {
	open: boolean;
	keyword: string;
	onSelect: (location: { id: string; name: string }) => void;
}

export const LocationTypeahead: React.FC<Props> = ({ onSelect, open, keyword }) => {
	const { data, isLoading } = useLocationSuggestions(keyword);
	const results = data?.data ?? [];

	if (!open || keyword.trim().length === 0) return null;

	const showLoading = isLoading && results.length === 0;

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
				borderRadius: 2,
			}}
		>
			{showLoading ? (
				<Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
					<CircularProgress size={24} />
				</Box>
			) : results.length > 0 ? (
				<List sx={{ p: 0 }}>
					{results.map((loc: AccommodationDetail) => (
						<ListItemButton key={loc.id} onClick={() => onSelect(loc)} sx={{ py: 1.5 }}>
							<Box>
								<Typography variant="body2" fontWeight={600}>
									{loc.name}
								</Typography>
								<Typography variant="caption" color="text.secondary">
									{[loc.address?.city, loc.type].filter(Boolean).join(" · ")}
								</Typography>
							</Box>
						</ListItemButton>
					))}
				</List>
			) : (
				// Chỉ hiện "No results" khi đã tìm xong (keyword đủ dài) mà không có data
				keyword.length > 1 && (
					<Box sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
						<Typography variant="body2">Không tìm thấy kết quả</Typography>
					</Box>
				)
			)}
		</Paper>
	);
};
