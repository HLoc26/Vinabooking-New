import React from "react";
import { Box, Paper, Typography, Divider, TextField, MenuItem, Slider, FormGroup, FormControlLabel, Checkbox, InputAdornment } from "@mui/material";
import { FilterList } from "@mui/icons-material";

import { ACCOMMODATION_TYPE_OPTIONS, PRICE_FILTER_CONFIG } from "../../constants/searchFilters";

interface SearchFiltersSidebarProps {
	loading: boolean;

	selectedType: string;
	facilityOptions: string[];
	onChangeType: (value: string) => void;

	priceRange: number[];
	minPriceInput: string;
	maxPriceInput: string;
	onChangeMinPriceInput: (value: string) => void;
	onChangeMaxPriceInput: (value: string) => void;
	onChangePriceRange: (range: number[]) => void;

	selectedFacilities: string[];
	onToggleFacility: (value: string) => void;

	onClearAllFilters: () => void;
	formatPrice: (price: number) => string;
}

export const SearchFiltersSidebar: React.FC<SearchFiltersSidebarProps> = ({
	loading,
	selectedType,
	facilityOptions,
	onChangeType,
	priceRange,
	minPriceInput,
	maxPriceInput,
	onChangeMinPriceInput,
	onChangeMaxPriceInput,
	onChangePriceRange,
	selectedFacilities,
	onToggleFacility,
	onClearAllFilters,
	formatPrice,
}) => {
	return (
		<Paper
			elevation={2}
			sx={{
				p: 3,
				position: "sticky",
				top: 100,
				borderRadius: 2,
				opacity: loading ? 0.7 : 1,
				transition: "opacity 0.3s",
			}}
		>
			<Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
				<FilterList sx={{ mr: 1 }} />
				<Typography variant="h6" fontWeight="bold">
					Filters
				</Typography>
			</Box>

			<Divider sx={{ mb: 2 }} />

			{/* Accommodation Type */}
			<Box sx={{ mb: 4 }}>
				<Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
					Accommodation Type
				</Typography>
				<TextField select fullWidth value={selectedType} onChange={(e) => onChangeType(e.target.value)} size="small" placeholder="All types" disabled={loading}>
					<MenuItem value="">All Types</MenuItem>
					{ACCOMMODATION_TYPE_OPTIONS.map((type) => (
						<MenuItem key={type.value} value={type.value}>
							{type.label}
						</MenuItem>
					))}
				</TextField>
			</Box>

			{/* Price Range */}
			<Box sx={{ mb: 2 }}>
				<Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
					Price Range (per night)
				</Typography>

				{/* Price Inputs */}
				<Box sx={{ display: "flex", gap: 2, mb: 2 }}>
					<TextField
						label="Min"
						size="small"
						value={minPriceInput}
						onChange={(e) => onChangeMinPriceInput(e.target.value)}
						disabled={loading}
						type="number"
						slotProps={{
							input: {
								startAdornment: <InputAdornment position="start">$</InputAdornment>,
							},
							htmlInput: {
								min: PRICE_FILTER_CONFIG.MIN,
								max: priceRange[1] - PRICE_FILTER_CONFIG.STEP,
								step: PRICE_FILTER_CONFIG.STEP,
							},
						}}
					/>
					<TextField
						label="Max"
						size="small"
						value={maxPriceInput}
						onChange={(e) => onChangeMaxPriceInput(e.target.value)}
						disabled={loading}
						type="number"
						slotProps={{
							input: {
								startAdornment: <InputAdornment position="start">$</InputAdornment>,
							},
							htmlInput: {
								min: priceRange[0] + PRICE_FILTER_CONFIG.STEP,
								max: PRICE_FILTER_CONFIG.MAX,
								step: PRICE_FILTER_CONFIG.STEP,
							},
						}}
					/>
				</Box>

				{/* Slider */}
				<Slider
					value={priceRange}
					onChange={(_e, newValue) => onChangePriceRange(newValue as number[])}
					valueLabelDisplay="auto"
					min={PRICE_FILTER_CONFIG.MIN}
					max={PRICE_FILTER_CONFIG.MAX}
					step={PRICE_FILTER_CONFIG.STEP}
					valueLabelFormat={(value) => `$${value}`}
					disabled={loading}
					sx={{
						mb: 0,
						"& .MuiSlider-thumb": {
							width: 20,
							height: 20,
						},
						"& .MuiSlider-track": {
							height: 4,
						},
						"& .MuiSlider-rail": {
							height: 4,
						},
					}}
				/>

				<Box sx={{ display: "flex", justifyContent: "space-between" }}>
					<Typography variant="body2" color="text.secondary">
						{formatPrice(priceRange[0])}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{formatPrice(priceRange[1])}
					</Typography>
				</Box>
			</Box>

			{/* Facilities */}
			<Box sx={{ mb: 1 }}>
				<Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0 }}>
					Facilities & Amenities
				</Typography>
				<Box sx={{ maxHeight: 240, overflowY: "auto", pr: 2 }}>
					<FormGroup>
						{facilityOptions.map((facility) => (
							<FormControlLabel
								key={facility}
								control={<Checkbox checked={selectedFacilities.includes(facility)} onChange={() => onToggleFacility(facility)} size="small" disabled={loading} />}
								label={
									<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
										<Typography variant="body2">{facility}</Typography>
									</Box>
								}
							/>
						))}
					</FormGroup>
				</Box>
			</Box>

			{/* Clear All Button */}
			<Box
				onClick={onClearAllFilters}
				sx={{
					py: 1.5,
					px: 2,
					border: "1px solid",
					borderColor: "divider",
					borderRadius: 1,
					textAlign: "center",
					cursor: loading ? "not-allowed" : "pointer",
					opacity: loading ? 0.5 : 1,
					transition: "all 0.2s",
					"&:hover": {
						bgcolor: loading ? "transparent" : "action.hover",
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
