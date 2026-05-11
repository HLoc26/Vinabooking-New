import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box, Paper, Typography, Divider, TextField, MenuItem, Slider, FormGroup, FormControlLabel, Checkbox, InputAdornment } from "@mui/material";
import { FilterList } from "@mui/icons-material";

// Types & Utils
import type { RootState } from "../../../../app/store";
import { ACCOMMODATION_TYPE_OPTIONS, PRICE_FILTER_CONFIG } from "../../constants/searchFilters";
import { EAccommodationType, type FacilityConfig } from "../../types/accommodation.types";

type SearchFiltersSidebarProps = {
	facilityList: FacilityConfig[];
	loading?: boolean;
};
export const SearchFiltersSidebar: React.FC<SearchFiltersSidebarProps> = ({ facilityList, loading = false }) => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	// Get data from Redux (url synced by parent)
	const criteria = useSelector((state: RootState) => state.search);

	// Local state for smooth UI slider, always in current currency
	const [localPrice, setLocalPrice] = useState<number[]>([criteria.price.min, criteria.price.max]);
	// Sync: when Redux changes due to URL change, update local state
	useEffect(() => {
		setLocalPrice([criteria.price.min, criteria.price.max]);
	}, [criteria.price.min, criteria.price.max]);

	// Helper: Update URL (Single Source of Truth)
	const updateFilter = (updates: Record<string, string | null>) => {
		const newParams = new URLSearchParams(searchParams);

		// Reset to page 1
		newParams.set("page", "1");

		Object.entries(updates).forEach(([key, value]) => {
			if (value === null || value === "") {
				newParams.delete(key);
			} else {
				newParams.set(key, value);
			}
		});

		navigate(`/search?${newParams.toString()}`);
	};

	// --- HANDLERS ---

	const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		updateFilter({
			type: value === EAccommodationType.ALL ? null : value,
		});
	};

	// Slider logic:
	const handleSliderChange = (_: Event, newValue: number | number[]) => {
		if (Array.isArray(newValue)) {
			setLocalPrice(newValue);
		}
	};

	const handleSliderCommit = (_: Event | React.SyntheticEvent | null, newValue: number | number[]) => {
		if (Array.isArray(newValue)) {
			updateFilter({
				minPrice: Math.round(newValue[0]).toString(),
				maxPrice: Math.round(newValue[1]).toString(),
			});
		}
	};

	// Input Text logic (Min/Max inputs)
	const handleInputChange = (type: "min" | "max", value: string) => {
		const numVal = Number(value);
		const newRange = type === "min" ? [numVal, localPrice[1]] : [localPrice[0], numVal];
		setLocalPrice(newRange);
	};

	const handleInputCommit = () => {
		updateFilter({
			minPrice: Math.round(localPrice[0]).toString(),
			maxPrice: Math.round(localPrice[1]).toString(),
		});
	};

	const toggleFacility = (facilityName: string) => {
		const currentFacilities = criteria.facilities;
		let newFacilities: string[];

		if (currentFacilities.includes(facilityName)) {
			newFacilities = currentFacilities.filter((f) => f !== facilityName);
		} else {
			newFacilities = [...currentFacilities, facilityName];
		}

		updateFilter({
			facilities: newFacilities.length > 0 ? newFacilities.join(",") : null,
		});
	};

	const clearAllFilters = () => {
		const newParams = new URLSearchParams();
		// Giữ lại keyword, date, guest
		if (searchParams.get("keyword")) newParams.set("keyword", searchParams.get("keyword")!);
		if (searchParams.get("checkIn")) newParams.set("checkIn", searchParams.get("checkIn")!);
		if (searchParams.get("checkOut")) newParams.set("checkOut", searchParams.get("checkOut")!);
		if (searchParams.get("adults")) newParams.set("adults", searchParams.get("adults")!);

		navigate(`/search?${newParams.toString()}`);
	};

	return (
		<Box sx={{ height: "100%", position: "relative" }}>
			<Paper
				elevation={0}
				variant="outlined"
				sx={{
					p: 3,
					borderRadius: 3,
					bgcolor: "white",
					opacity: loading ? 0.7 : 1,
					pointerEvents: loading ? "none" : "auto",
					transition: "opacity 0.2s",
					position: "sticky",
					top: 160,
					zIndex: 10,
				}}
			>
				{/* HEADER */}
				<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
					<FilterList sx={{ mr: 1 }} fontSize="small" />
					<Typography variant="h6" fontWeight="bold">
						Bộ lọc
					</Typography>
				</Box>
				<Divider sx={{ mb: 3 }} />

				{/* TYPE */}
				<Box sx={{ mb: 4 }}>
					<Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>
						Loại chỗ ở
					</Typography>
					<TextField select fullWidth value={criteria.type || EAccommodationType.ALL} onChange={handleTypeChange} size="small" disabled={loading}>
						{ACCOMMODATION_TYPE_OPTIONS.map((type) => (
							<MenuItem key={type.value} value={type.value}>
								{type.label}
							</MenuItem>
						))}
					</TextField>
				</Box>

				{/* PRICE */}
				<Box sx={{ mb: 4 }}>
					<Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>
						Khoảng giá
					</Typography>
					<Slider
						value={localPrice}
						onChange={handleSliderChange}
						onChangeCommitted={handleSliderCommit}
						min={PRICE_FILTER_CONFIG.MIN}
						max={PRICE_FILTER_CONFIG.MAX}
						step={PRICE_FILTER_CONFIG.STEP}
						valueLabelDisplay="auto"
						disabled={loading}
					/>
					<Box sx={{ display: "flex", gap: 2, mt: 1 }}>
						<TextField
							label="Min"
							size="small"
							type="number"
							value={localPrice[0] || 0}
							onChange={(e) => handleInputChange("min", e.target.value)}
							onBlur={handleInputCommit}
							slotProps={{
								input: {
									endAdornment: <InputAdornment position="end">VND</InputAdornment>,
								},
							}}
						/>
						<TextField
							label="Max"
							size="small"
							type="number"
							value={localPrice[1] || 0}
							onChange={(e) => handleInputChange("max", e.target.value)}
							onBlur={handleInputCommit}
							slotProps={{
								input: {
									startAdornment: <InputAdornment position="start">VND</InputAdornment>,
								},
							}}
						/>
					</Box>
				</Box>

				{/* FACILITIES */}
				<Box sx={{ mb: 3 }}>
					<Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>
						Tiện ích
					</Typography>
					<Box sx={{ maxHeight: 150, overflowY: "auto" }}>
						<FormGroup>
							{facilityList.map((facility) => (
								<FormControlLabel
									key={facility.id}
									control={<Checkbox checked={criteria.facilities.includes(facility.name)} onChange={() => toggleFacility(facility.name)} size="small" />}
									label={<Typography variant="body2">{facility.name}</Typography>}
								/>
							))}
						</FormGroup>
					</Box>
				</Box>

				{/* CLEAR BUTTON */}
				<Box
					onClick={clearAllFilters}
					sx={{
						py: 1.5,
						textAlign: "center",
						cursor: "pointer",
						borderRadius: 1,
						"&:hover": { bgcolor: "action.hover", color: "primary.main" },
					}}
				>
					<Typography variant="body2" fontWeight="600" sx={{ textDecoration: "underline" }}>
						Xóa bộ lọc
					</Typography>
				</Box>
			</Paper>
		</Box>
	);
};
