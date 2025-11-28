import React, { useState, useEffect, useCallback } from "react";
import { Box, Paper, Typography, Divider, TextField, MenuItem, Slider, FormGroup, FormControlLabel, Checkbox, InputAdornment } from "@mui/material";
import { FilterList } from "@mui/icons-material";

import { ACCOMMODATION_TYPE_OPTIONS, PRICE_FILTER_CONFIG } from "../../constants/searchFilters";
import useSearchFromParams from "../../hooks/useSearchFromParams";
import { parseEAccommodationType } from "../../../../utils/search";
import { EAccommodationType, type Facility } from "../../../../types/Accommodation";
import { useNavigate } from "react-router-dom";
import { standardize } from "../../../../utils/moneyConverter";
import { useSticky } from "../../../../hooks/useSticky";

type SearchFiltersSidebar = {
	facilityList: Facility[];
};

export const SearchFiltersSidebar: React.FC<SearchFiltersSidebar> = ({ facilityList }) => {
	const navigate = useNavigate();
	const { criteria, loading } = useSearchFromParams();

	// Local state for debounce
	const [pendingParams, setPendingParams] = useState<URLSearchParams | null>(null);
	const [locals, setLocals] = useState({
		type: criteria.type,
		price: {
			min: criteria.price.min,
			max: criteria.price.max,
		},
		facilities: criteria.facilities,
	});

	// Debounced navigate
	useEffect(() => {
		if (!pendingParams) return;
		const handler = setTimeout(() => {
			console.log("navigating", pendingParams);
			navigate(`/search?${pendingParams.toString()}`, { replace: true });
		}, 300); // 300ms debounce
		return () => clearTimeout(handler);
	}, [pendingParams, navigate]);

	const updateParams = useCallback((updates: Record<string, string | number>) => {
		const newParams = new URLSearchParams(window.location.search);
		Object.entries(updates).forEach(([key, value]) => {
			newParams.set(key, Array.isArray(value) ? value.join(",") : value.toString());
		});
		setPendingParams(newParams);
	}, []);

	const handleTypeChange = (value: string) => setLocals((prev) => ({ ...prev, type: parseEAccommodationType(value) }));

	const handleMinPriceChange = (value: number) => setLocals((prev) => ({ ...prev, price: { ...prev.price, min: value } }));
	const handleMaxPriceChange = (value: number) => setLocals((prev) => ({ ...prev, price: { ...prev.price, max: value } }));
	const commitPrice = () => updateParams({ minPrice: locals.price.min, maxPrice: locals.price.max });

	const handlePriceRangeCommit = (_: Event | React.SyntheticEvent<Element, Event>, value: number[]) => {
		if (Array.isArray(value)) updateParams({ minPrice: value[0], maxPrice: value[1] });
	};

	const toggleFacility = (facility: string) => {
		setLocals((prev) => {
			const newFacilities = prev.facilities.includes(facility) ? prev.facilities.filter((f) => f !== facility) : [...prev.facilities, facility];
			updateParams({ facilities: newFacilities.join(",") });
			return { ...prev, facilities: newFacilities };
		});
	};

	const clearAllFilters = () => {
		setLocals({
			type: EAccommodationType.ALL,
			price: { min: PRICE_FILTER_CONFIG.MIN, max: PRICE_FILTER_CONFIG.MAX },
			facilities: [],
		});
		updateParams({
			type: EAccommodationType.ALL,
			minPrice: PRICE_FILTER_CONFIG.MIN,
			maxPrice: PRICE_FILTER_CONFIG.MAX,
			facilities: "",
		});
	};
	useSticky(200);

	return (
		<Paper
			elevation={2}
			sx={{
				p: 3,
				position: "sticky",
				top: 180,
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
			<Divider sx={{ mb: 1 }} />

			{/* Accommodation Type */}
			<Box sx={{ mb: 1 }}>
				<Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0 }}>
					Accommodation Type
				</Typography>
				<TextField
					select
					fullWidth
					value={locals.type}
					onChange={(e) => {
						const value = e.target.value;
						handleTypeChange(value);
						updateParams({ type: parseEAccommodationType(value) }); // commit right away
					}}
					size="small"
					disabled={loading}
				>
					{ACCOMMODATION_TYPE_OPTIONS.map((type) => (
						<MenuItem key={type.value} value={type.value}>
							{type.label}
						</MenuItem>
					))}
				</TextField>
			</Box>

			{/* Price Range */}
			<Box sx={{ mb: 2 }}>
				<Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.5 }}>
					Price Range (per night)
				</Typography>
				<Box sx={{ display: "flex", gap: 2, mb: 1, justifyContent: "space-between" }}>
					<TextField
						label="Min"
						size="small"
						value={locals.price.min}
						onChange={(e) => handleMinPriceChange(Number(e.target.value))}
						onBlur={commitPrice}
						disabled={loading}
						type="number"
						slotProps={{
							input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
							htmlInput: { min: PRICE_FILTER_CONFIG.MIN, max: locals.price.max - PRICE_FILTER_CONFIG.STEP, step: PRICE_FILTER_CONFIG.STEP },
						}}
					/>
					<TextField
						label="Max"
						size="small"
						value={locals.price.max}
						onChange={(e) => handleMaxPriceChange(Number(e.target.value))}
						onBlur={commitPrice}
						disabled={loading}
						type="number"
						slotProps={{
							input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
							htmlInput: { min: locals.price.min + PRICE_FILTER_CONFIG.STEP, max: PRICE_FILTER_CONFIG.MAX, step: PRICE_FILTER_CONFIG.STEP },
						}}
					/>
				</Box>
				<Slider
					value={[locals.price.min, locals.price.max]}
					onChange={(_e, v) =>
						Array.isArray(v) &&
						setLocals((prev) => ({
							...prev,
							price: { min: v[0], max: v[1] },
						}))
					}
					valueLabelDisplay="auto"
					min={PRICE_FILTER_CONFIG.MIN}
					max={PRICE_FILTER_CONFIG.MAX}
					step={PRICE_FILTER_CONFIG.STEP}
					onChangeCommitted={handlePriceRangeCommit}
					valueLabelFormat={(v) => `$${v}`}
					disabled={loading}
				/>
				<Box sx={{ display: "flex", justifyContent: "space-between" }}>
					<Typography variant="body2" color="text.secondary">
						{standardize(locals.price.min)}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{standardize(locals.price.max)}
					</Typography>
				</Box>
			</Box>

			{/* Facilities */}
			<Box sx={{ mb: 1 }}>
				<Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0 }}>
					Facilities & Amenities
				</Typography>
				<Box sx={{ maxHeight: 200, overflowY: "auto", pr: 2 }}>
					<FormGroup>
						{facilityList.map((facility) => (
							<FormControlLabel
								key={facility.id}
								control={<Checkbox checked={locals.facilities.includes(facility.name)} onChange={() => toggleFacility(facility.name)} size="small" disabled={loading} />}
								label={facility.name}
							/>
						))}
					</FormGroup>
				</Box>
			</Box>

			<Box
				onClick={clearAllFilters}
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
					"&:hover": { bgcolor: loading ? "transparent" : "action.hover" },
				}}
			>
				<Typography variant="body2" fontWeight="medium">
					Clear All Filters
				</Typography>
			</Box>
		</Paper>
	);
};
