import React, { useCallback, useRef, useState, useEffect } from "react";
import { Box, Paper, Button, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import SearchIcon from "@mui/icons-material/SearchRounded";
import CalendarIcon from "@mui/icons-material/CalendarMonthRounded";
import UserIcon from "@mui/icons-material/PersonRounded";
import ChevronDownIcon from "@mui/icons-material/KeyboardArrowDownRounded";

import { GuestMenu } from "./components/GuestMenu";
import { LocationTypeahead } from "./components/LocationTypeahead";
import { useSticky } from "../../../../../hooks/useSticky";
import { DatePickerMenu } from "../../../../../components/shared/DatePickerMenu";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../../../app/store";
import { updateSearchCriteria } from "../../../../search/searchSlice";
import type { Dates, Query } from "../../../../../types/Query";
import { buildSearchParams } from "../../../../../utils/search";
import { setBookingField } from "../../../../booking/bookingSlice";
import { useDebounce } from "../../../../../hooks/useDebounce";

const PAPER_HEIGHT = 72;
const FIXED_TOP_OFFSET = 16;
const PLACEHOLDER_HEIGHT = PAPER_HEIGHT + FIXED_TOP_OFFSET;

const SectionBox: React.FC<{
	Icon: React.ElementType;
	RightIcon?: React.ReactNode;
	label: string;
	children: React.ReactNode;
	onClick: () => void;
}> = ({ Icon, RightIcon, label, children, onClick }) => (
	<Box
		onClick={onClick}
		sx={{
			display: "flex",
			alignItems: "center",
			height: "100%",
			minHeight: 72,
			py: 0.75,
			px: 3,
			cursor: "pointer",
			"&:hover": { bgcolor: "action.hover" },
		}}
	>
		<Icon sx={{ mr: 2, opacity: 0.7 }} />
		<Box textAlign="left" sx={{ flexGrow: 1 }}>
			<Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={0.5}>
				{label}
			</Typography>
			{children}
		</Box>
		{RightIcon && <Box sx={{ ml: 1, display: "flex", alignItems: "center" }}>{RightIcon}</Box>}
	</Box>
);

const SearchBar: React.FC = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { sentinelRef: searchRef, sticky } = useSticky(175);
	const criteria = useSelector((state: RootState) => state.search);

	// Local state
	const [keyword, setKeyword] = useState(criteria.keyword);

	const debouncedKeyword = useDebounce(keyword, 300);

	const [dates, setDates] = useState<Dates>(criteria.dates);
	const [guests, setGuests] = useState(criteria.guests);

	// Refs for dropdowns
	const refs = {
		location: useRef<HTMLDivElement | null>(null),
		date: useRef<HTMLDivElement | null>(null),
		guest: useRef<HTMLDivElement | null>(null),
	};

	const [isDropDownOpen, setDropDownOpen] = useState({ location: false, date: false, guest: false });
	const handleToggleDropdown = useCallback(<K extends keyof typeof isDropDownOpen>(key: K, open: boolean) => {
		setDropDownOpen((prev) => ({ ...prev, [key]: open }));
	}, []);

	const handleUpdateSearchCriteria = useCallback(
		<K extends keyof Query>(key: K, value: Query[K]) => {
			console.log(key, value);
			dispatch(updateSearchCriteria({ key, value }));
		},
		[dispatch]
	);

	const handleSearch = () => {
		// Sync latest data from LocalState to Redux
		handleUpdateSearchCriteria("keyword", keyword);
		handleUpdateSearchCriteria("dates", dates);
		handleUpdateSearchCriteria("guests", guests);

		const queryString = buildSearchParams({
			...criteria, // Get other filters (price, type...)
			keyword, // Overwrite with local state
			dates,
			guests,
		});

		navigate(`/search?${queryString}`);
	};

	// Keep local state in sync if context changes externally
	useEffect(() => {
		setKeyword(criteria.keyword);
		setDates(criteria.dates);
		setGuests(criteria.guests);
	}, [criteria.keyword, criteria.dates, criteria.guests]);

	useEffect(() => {
		handleUpdateSearchCriteria("keyword", debouncedKeyword);
	}, [debouncedKeyword, handleUpdateSearchCriteria]);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (refs.location.current && !refs.location.current.contains(e.target as Node)) {
				handleToggleDropdown("location", false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [handleToggleDropdown]);

	return (
		<>
			{/* For sticky */}
			<div ref={searchRef} style={{ position: "absolute", top: -FIXED_TOP_OFFSET, height: "1px", width: "100%" }} />
			<Box
				sx={{
					position: "relative",
					width: "100%",
					maxWidth: "1200px",
					mx: "auto",
					px: { xs: 2, md: 3 },
					zIndex: sticky ? 1300 : 50,
					minHeight: sticky ? `${PLACEHOLDER_HEIGHT}px` : "auto",
					transition: "all 0.25s ease",
				}}
			>
				<Paper
					elevation={sticky ? 3 : 1}
					sx={{
						position: sticky ? "fixed" : "relative",
						mt: sticky ? { xs: "56px", md: "64px" } : 0,
						top: sticky ? 8 : "auto",
						left: sticky ? "50%" : "auto",
						transform: sticky ? "translateX(-50%)" : "none",

						maxWidth: sticky ? { xs: "100%", sm: "100%", md: "90%" } : "100%",
						width: "100%",

						display: "grid",
						gridTemplateColumns: {
							xs: "1fr",
							sm: "1fr 1fr",
							md: "2.2fr 1.7fr 1fr auto",
						},
						gridTemplateAreas: {
							xs: `"destination" "dates" "guests" "search"`,
							sm: `"destination destination" "dates guests" "search search"`,
							md: `"destination dates guests search"`,
						},
						gap: 0,
						borderRadius: 4,
						overflow: "visible",
						minHeight: PAPER_HEIGHT,
					}}
				>
					{/* DESTINATION */}
					<Box ref={refs.location} sx={{ gridArea: "destination", position: "relative", borderRight: { md: "1px solid" }, borderRightColor: { md: "grey.300" } }}>
						<SectionBox Icon={SearchIcon} label="Where" onClick={() => handleToggleDropdown("location", true)}>
							<TextField
								placeholder="Search destinations"
								variant="standard"
								value={keyword}
								onChange={(e) => setKeyword(e.target.value)}
								onFocus={(e) => {
									e.stopPropagation();
									handleToggleDropdown("location", true);
								}}
								onClick={(e) => e.stopPropagation()}
								slotProps={{
									input: {
										disableUnderline: true,
										sx: { fontSize: "1rem", fontWeight: 600, color: "text.primary" },
									},
								}}
								sx={{ width: "100%", "& input": { cursor: "text", pointerEvents: "auto" } }}
							/>
						</SectionBox>

						<LocationTypeahead
							open={isDropDownOpen.location}
							keyword={debouncedKeyword} // ADDED: Pass the debounced keyword here to limit API calls
							onSelect={(loc) => {
								const newKeyword = loc.name ?? "";
								setKeyword(newKeyword);
								// The useEffect will automatically catch this and update Redux after the delay
								handleToggleDropdown("location", false);
							}}
						/>
					</Box>

					{/* DATES */}
					<Box
						ref={refs.date}
						sx={{
							gridArea: "dates",
							borderRight: { md: "1px solid" },
							borderRightColor: { md: "grey.300" },
							borderTop: { xs: "1px solid", sm: "none" },
							borderTopColor: { xs: "grey.300" },
						}}
					>
						<SectionBox Icon={CalendarIcon} label="Check in — Check out" onClick={() => handleToggleDropdown("date", true)}>
							<Box display="flex" gap={1.5} alignItems="center">
								<Box>
									<Typography variant="body2" fontWeight={700} lineHeight={1.2}>
										{dates.checkIn.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}{" "}
									</Typography>
									<Typography variant="caption" color="text.secondary" fontSize="0.7rem">
										{dates.checkIn.toLocaleDateString("en-US", { weekday: "short" })}
									</Typography>
								</Box>
								<Typography variant="body2" color="text.secondary">
									—
								</Typography>
								<Box>
									<Typography variant="body2" fontWeight={700} lineHeight={1.2}>
										{dates.checkOut?.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
									</Typography>
									<Typography variant="caption" color="text.secondary" fontSize="0.7rem">
										{dates.checkOut?.toLocaleDateString("en-US", { weekday: "short" })}
									</Typography>
								</Box>
							</Box>
						</SectionBox>

						<DatePickerMenu
							open={isDropDownOpen.date}
							anchorEl={refs.date.current}
							selectedDates={dates}
							setSelectedDates={setDates}
							onClose={() => {
								handleUpdateSearchCriteria("dates", dates);
								const d = new Date();
								d.setDate(d.getDate() + 2);
								d.setHours(0, 0, 0, 0);
								dispatch(setBookingField({ key: "startDate", value: dates.checkIn }));
								dispatch(setBookingField({ key: "endDate", value: dates.checkOut ?? d }));
								handleToggleDropdown("date", false);
							}}
						/>
					</Box>

					{/* GUESTS */}
					<Box
						ref={refs.guest}
						sx={{
							gridArea: "guests",
							borderRight: { md: "1px solid" },
							borderRightColor: { md: "grey.300" },
							borderTop: { xs: "1px solid", sm: "none" },
							borderTopColor: { xs: "grey.300" },
						}}
					>
						<SectionBox Icon={UserIcon} RightIcon={<ChevronDownIcon sx={{ opacity: 0.5 }} fontSize="small" />} label="Who" onClick={() => handleToggleDropdown("guest", true)}>
							<Typography variant="body1" fontWeight={600}>
								{guests.adults + guests.children} guest{guests.adults + guests.children !== 1 ? "s" : ""} · {guests.rooms} room{guests.rooms !== 1 ? "s" : ""}
							</Typography>
						</SectionBox>

						<GuestMenu
							open={isDropDownOpen.guest}
							anchorEl={refs.guest.current}
							guests={guests}
							onGuestsChange={setGuests}
							onClose={() => {
								handleUpdateSearchCriteria("guests", guests);
								handleToggleDropdown("guest", false);
							}}
						/>
					</Box>

					{/* SEARCH BUTTON */}
					<Box sx={{ gridArea: "search" }}>
						<Button
							fullWidth
							variant="contained"
							color="warning"
							size="large"
							startIcon={<SearchIcon />}
							onClick={handleSearch}
							sx={{ height: "100%", minHeight: 72, borderRadius: { xs: 4, sm: 4, md: "0 16px 16px 0" }, fontWeight: 700, fontSize: "1.1rem", textTransform: "none" }}
						>
							Search
						</Button>
					</Box>
				</Paper>
			</Box>
		</>
	);
};
export default SearchBar;
