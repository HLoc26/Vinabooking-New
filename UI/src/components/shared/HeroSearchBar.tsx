import React, { useCallback, useRef, useState, useEffect } from "react";
import { Box, Paper, Button, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import SearchIcon from "@mui/icons-material/SearchRounded";
import CalendarIcon from "@mui/icons-material/CalendarMonthRounded";
import UserIcon from "@mui/icons-material/PersonRounded";
import ChevronDownIcon from "@mui/icons-material/KeyboardArrowDownRounded";

import { DatePickerMenu } from "./DatePickerMenu";
import { GuestMenu } from "./GuestMenu";
import { LocationTypeahead } from "./LocationTypeahead";
import useSearchContext from "../../context/SearchContext/hook";
import { useSticky } from "../../hooks/useSticky";
import { buildSearchParams } from "../../utils/search";
import useBookingContextProvider from "../../context/BookingContext/hook";
import useSearchFromParams from "../../features/accommodation/hooks/useSearchFromParams";

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

export const HeroSearchBar: React.FC = () => {
	const { ref: searchRef, sticky } = useSticky(175);
	const { searchCriteria, handleUpdateSearchCriteria } = useSearchContext();
	const { criteria } = useSearchFromParams();
	const { updateBookingInfo } = useBookingContextProvider();
	const navigate = useNavigate();

	// Local state
	const [keyword, setKeyword] = useState(searchCriteria.keyword);
	const [dates, setDates] = useState(searchCriteria.dates);
	const [guests, setGuests] = useState(searchCriteria.guests);

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

	const commitAll = () => {
		handleUpdateSearchCriteria("keyword", keyword);
		handleUpdateSearchCriteria("dates", dates);
		handleUpdateSearchCriteria("guests", guests);
	};

	const handleMainSearch = () => {
		commitAll();
		const params = buildSearchParams({ ...searchCriteria, keyword, dates, guests });
		navigate(`/search?${params}`);
	};

	// Keep local state in sync if context changes externally
	useEffect(() => {
		setKeyword(criteria.keyword);
		setDates(criteria.dates);
		setGuests(criteria.guests);
	}, [criteria.keyword, criteria.dates, criteria.guests]);

	return (
		<Box
			ref={searchRef}
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
				<Box
					onBlur={() => handleToggleDropdown("location", false)}
					ref={refs.location}
					sx={{ gridArea: "destination", position: "relative", borderRight: { md: "1px solid" }, borderRightColor: { md: "grey.300" } }}
				>
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
						keyword={keyword}
						onSelect={(loc) => {
							setKeyword(loc.name ?? "");
							handleToggleDropdown("location", false);
						}}
					/>
				</Box>

				{/* DATES */}
				<Box
					ref={refs.date}
					sx={{ gridArea: "dates", borderRight: { md: "1px solid" }, borderRightColor: { md: "grey.300" }, borderTop: { xs: "1px solid", sm: "none" }, borderTopColor: { xs: "grey.300" } }}
				>
					<SectionBox Icon={CalendarIcon} label="Check in — Check out" onClick={() => handleToggleDropdown("date", true)}>
						<Box display="flex" gap={1.5} alignItems="center">
							<Box>
								<Typography variant="body2" fontWeight={700} lineHeight={1.2}>
									{dates.checkIn.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
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
							updateBookingInfo("startDate", dates.checkIn);
							const d = new Date();
							d.setDate(d.getDate() + 2);
							d.setHours(0, 0, 0, 0);
							updateBookingInfo("endDate", dates.checkOut ?? d);
							handleToggleDropdown("date", false);
						}}
					/>
				</Box>

				{/* GUESTS */}
				<Box
					ref={refs.guest}
					sx={{ gridArea: "guests", borderRight: { md: "1px solid" }, borderRightColor: { md: "grey.300" }, borderTop: { xs: "1px solid", sm: "none" }, borderTopColor: { xs: "grey.300" } }}
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
						onClick={handleMainSearch}
						sx={{ height: "100%", minHeight: 72, borderRadius: { xs: 4, sm: 4, md: "0 16px 16px 0" }, fontWeight: 700, fontSize: "1.1rem", textTransform: "none" }}
					>
						Search
					</Button>
				</Box>
			</Paper>
		</Box>
	);
};
