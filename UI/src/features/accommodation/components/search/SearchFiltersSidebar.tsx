import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box, Paper, Typography, Divider, TextField, MenuItem, Slider, FormGroup, FormControlLabel, Checkbox, InputAdornment, Chip } from "@mui/material";
import { FilterList, Pets, SmokingRooms, MusicNote } from "@mui/icons-material";

// Types & Utils
import type { RootState } from "../../../../app/store";
import { ACCOMMODATION_TYPE_OPTIONS, PRICE_FILTER_CONFIG, CANCELLATION_EN_LABELS, PREPAYMENT_EN_LABELS } from "../../constants/searchFilters";
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
			if (value === null || value === "" || value === "ANY") {
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

	const togglePolicyBoolean = (policyKey: "allowsPets" | "allowsSmoking" | "allowsParties") => {
		updateFilter({
			[policyKey]: criteria[policyKey] ? null : "true",
		});
	};

	const handleSelectChange = (key: string, value: string) => {
		updateFilter({
			[key]: value === "ANY" ? null : value,
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

	const checkInOptions = ["ANY", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];
	const checkOutOptions = ["ANY", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
	const quietHoursOptions = ["ANY", "20:00", "21:00", "22:00", "23:00", "00:00"];

	return (
		<Box sx={{ position: "relative" }}>
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
					top: 110,
					zIndex: 10,
					maxHeight: "calc(100vh - 140px)",
					overflowY: "auto",
					"&::-webkit-scrollbar": { width: "5px" },
					"&::-webkit-scrollbar-track": { bgcolor: "transparent" },
					"&::-webkit-scrollbar-thumb": { bgcolor: "grey.300", borderRadius: "10px" },
				}}
			>
				{/* HEADER */}
				<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
					<FilterList sx={{ mr: 1 }} fontSize="small" />
					<Typography variant="h6" fontWeight="bold">
						Filters
					</Typography>
				</Box>
				<Divider sx={{ mb: 3 }} />

				{/* TYPE */}
				<Box sx={{ mb: 4 }}>
					<Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>
						Accommodation Type
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
						Price Range
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
							inputProps={{ step: 1000 }}
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
							inputProps={{ step: 1000 }}
							slotProps={{
								input: {
									endAdornment: <InputAdornment position="end">VND</InputAdornment>,
								},
							}}
						/>
					</Box>
				</Box>

				{/* FACILITIES */}
				<Box sx={{ mb: 4 }}>
					<Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>
						Facilities
					</Typography>
					<Box sx={{ maxHeight: 150, overflowY: "auto", pr: 1, "&::-webkit-scrollbar": { width: "4px" }, "&::-webkit-scrollbar-thumb": { bgcolor: "grey.200", borderRadius: "10px" } }}>
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

				<Divider sx={{ mb: 4 }} />

				{/* ACCOMMODATION POLICIES */}
				<Box sx={{ mb: 4 }}>
					<Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
						Policies & House Rules
					</Typography>

					{/* House Rules Chips */}
					<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 4 }}>
						<Chip
							icon={<Pets sx={{ fontSize: "16px !important" }} />}
							label="Pets"
							onClick={() => togglePolicyBoolean("allowsPets")}
							color={criteria.allowsPets ? "primary" : "default"}
							variant={criteria.allowsPets ? "filled" : "outlined"}
							sx={{ fontWeight: 600 }}
						/>
						<Chip
							icon={<SmokingRooms sx={{ fontSize: "16px !important" }} />}
							label="Smoking"
							onClick={() => togglePolicyBoolean("allowsSmoking")}
							color={criteria.allowsSmoking ? "primary" : "default"}
							variant={criteria.allowsSmoking ? "filled" : "outlined"}
							sx={{ fontWeight: 600 }}
						/>
						<Chip
							icon={<MusicNote sx={{ fontSize: "16px !important" }} />}
							label="Parties"
							onClick={() => togglePolicyBoolean("allowsParties")}
							color={criteria.allowsParties ? "primary" : "default"}
							variant={criteria.allowsParties ? "filled" : "outlined"}
							sx={{ fontWeight: 600 }}
						/>
					</Box>

					{/* Booking Conditions */}
					<Typography variant="subtitle2" fontWeight="bold" color="text.secondary" sx={{ mb: 1.5, textTransform: "uppercase", fontSize: "0.75rem" }}>
						Booking Conditions
					</Typography>
					<Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 4 }}>
						<TextField
							select
							fullWidth
							label="Cancellation Policy"
							value={criteria.cancellationPolicy || "ANY"}
							onChange={(e) => handleSelectChange("cancellationPolicy", e.target.value)}
							size="small"
						>
							{Object.entries(CANCELLATION_EN_LABELS).map(([key, label]) => (
								<MenuItem key={key} value={key}>
									{label}
								</MenuItem>
							))}
						</TextField>
						<TextField
							select
							fullWidth
							label="Prepayment Policy"
							value={criteria.prepaymentPolicy || "ANY"}
							onChange={(e) => handleSelectChange("prepaymentPolicy", e.target.value)}
							size="small"
						>
							{Object.entries(PREPAYMENT_EN_LABELS).map(([key, label]) => (
								<MenuItem key={key} value={key}>
									{label}
								</MenuItem>
							))}
						</TextField>
					</Box>

					{/* Timings */}
					<Typography variant="subtitle2" fontWeight="bold" color="text.secondary" sx={{ mb: 1.5, textTransform: "uppercase", fontSize: "0.75rem" }}>
						Timing
					</Typography>
					<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
						<TextField select fullWidth label="Desired Check-in" value={criteria.checkInTime || "ANY"} onChange={(e) => handleSelectChange("checkInTime", e.target.value)} size="small">
							{checkInOptions.map((time) => (
								<MenuItem key={time} value={time}>
									{time === "ANY" ? "Any time" : time}
								</MenuItem>
							))}
						</TextField>
						<TextField select fullWidth label="Desired Check-out" value={criteria.checkOutTime || "ANY"} onChange={(e) => handleSelectChange("checkOutTime", e.target.value)} size="small">
							{checkOutOptions.map((time) => (
								<MenuItem key={time} value={time}>
									{time === "ANY" ? "Any time" : time}
								</MenuItem>
							))}
						</TextField>
						<TextField select fullWidth label="Quiet Hours" value={criteria.quietHoursStart || "ANY"} onChange={(e) => handleSelectChange("quietHoursStart", e.target.value)} size="small">
							{quietHoursOptions.map((time) => (
								<MenuItem key={time} value={time}>
									{time === "ANY" ? "No preference" : time}
								</MenuItem>
							))}
						</TextField>
					</Box>
				</Box>

				<Divider sx={{ mb: 3 }} />

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
						Clear all
					</Typography>
				</Box>
			</Paper>
		</Box>
	);
};
