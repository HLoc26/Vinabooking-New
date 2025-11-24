// HeroSearchBar.tsx
import React from "react";
import { Box, Paper, Button, TextField, Typography, useTheme } from "@mui/material";

// 1. Replaced Lucide imports with MUI Icons
import SearchIcon from "@mui/icons-material/SearchRounded";
import CalendarIcon from "@mui/icons-material/CalendarMonthRounded";
import UserIcon from "@mui/icons-material/PersonRounded";
import ChevronDownIcon from "@mui/icons-material/KeyboardArrowDownRounded";

import type { RefObject } from "react";
import type { DateRange } from "../../accommodation-type/types/DateRange";
import type { Guests } from "../../accommodation-type/types/Guest";

import { DatePickerMenu } from "../../accommodation-type/components/DatePickerMenu";
import { GuestMenu } from "./GuestMenu";
import { LocationTypeahead } from "./LocationTypeAhead";
import { useLocationSearch } from "../../../context/SearchContext/Index";

interface HeroSearchBarProps {
	searchRef?: RefObject<HTMLDivElement>;
	locationRef?: RefObject<HTMLDivElement | null>;
	dateRef?: RefObject<HTMLDivElement | null>;
	guestRef?: RefObject<HTMLDivElement | null>;
	sticky: boolean;
	keyword: string;
	setKeyword: (keyword: string) => void;
	openLocation: boolean;
	setOpenLocation: (open: boolean) => void;

	dateRange: DateRange;
	tempDateRange: DateRange;
	setTempDateRange: (range: DateRange) => void;
	setDateRange: (range: DateRange) => void;
	isDateMenuOpen: boolean;
	setIsDateMenuOpen: (open: boolean) => void;
	monthOffset: number;
	setMonthOffset: (offset: number) => void;

	guests: Guests;
	setGuests: (g: Guests) => void;
	isGuestMenuOpen: boolean;
	setIsGuestMenuOpen: (open: boolean) => void;
}

// Common styles for all interactive sections
const sectionBoxStyles = {
	display: "flex",
	alignItems: "center",
	height: "100%",
	minHeight: 72,
	py: 2,
	px: 3,
	cursor: "pointer",
	"&:hover": { bgcolor: "action.hover" },
};

// Adjusted to use MUI prop sizing
const iconStyles = { marginRight: 2, opacity: 0.7 }; // 2 units (16px) is equivalent to your previous inline style

const labelStyles = {
	variant: "caption" as const,
	fontWeight: 700,
	color: "text.secondary",
	display: "block",
	mb: 0.5,
};

// 🌟 FIX: Define the required fixed dimensions
const PAPER_HEIGHT = 72; // The minimum height of the Paper (the sticky bar content)
const FIXED_TOP_OFFSET = 16; // The 'top' value when fixed (16px)

// Placeholder Height = PAPER_HEIGHT + FIXED_TOP_OFFSET
const PLACEHOLDER_HEIGHT = PAPER_HEIGHT + FIXED_TOP_OFFSET;

export const HeroSearchBar: React.FC<HeroSearchBarProps> = (props) => {
	const {
		searchRef,
		locationRef,
		dateRef,
		guestRef,
		sticky,
		keyword,
		setKeyword,
		openLocation,
		setOpenLocation,
		dateRange,
		tempDateRange,
		setTempDateRange,
		setDateRange,
		isDateMenuOpen,
		setIsDateMenuOpen,
		monthOffset,
		setMonthOffset,
		guests,
		setGuests,
		isGuestMenuOpen,
		setIsGuestMenuOpen,
	} = props;

	// --- Logic functions remain unchanged ---
	const handleDateClick = (date: Date) => {
		if (!tempDateRange.checkIn || tempDateRange.checkOut) {
			setTempDateRange({ checkIn: date, checkOut: null });
		} else if (date < tempDateRange.checkIn!) {
			setTempDateRange({ checkIn: date, checkOut: tempDateRange.checkIn });
		} else {
			setTempDateRange({ ...tempDateRange, checkOut: date });
		}
	};

	const { query } = useLocationSearch();

	const handleMainSearch = () => {
		const params: Record<string, any> = {
			keyword: keyword.trim(),
		};

		if (query.type) params.type = query.type;
		if (dateRange.checkIn) {
			params.checkIn = dateRange.checkIn.toISOString().split("T")[0];
		}
		if (dateRange.checkOut) {
			params.checkOut = dateRange.checkOut.toISOString().split("T")[0];
		}
		if (guests.adults) params.adults = guests.adults;
		if (guests.children) params.children = guests.children;
		if (guests.rooms) params.rooms = guests.rooms;

		console.log("Full search params:", params);
	};

	const handleDateClose = () => {
		if (tempDateRange.checkIn && tempDateRange.checkOut) {
			setDateRange(tempDateRange);
		}
		setIsDateMenuOpen(false);
	};

	const theme = useTheme();
	// Max width calculation for the fixed Paper (1200px - 2*paddingX).
	// md padding (3 units = 24px). Fixed Max Width = 1200 - 48 = 1152px.
	const fixedMaxWidth = theme.breakpoints.up("md") ? "1152px" : "calc(100% - 32px)";

	return (
		// 🐛 FIX: The outer Box now holds the searchRef and acts ONLY as the placeholder.
		// It must NOT be position: fixed. It must reserve the height.
		<Box
			ref={searchRef}
			sx={{
				position: "relative",
				width: "100%",
				maxWidth: "1200px",
				mx: "auto",
				px: { xs: 2, md: 3 },
				zIndex: sticky ? 1300 : 50,
				// **Crucial Fix**: Set the placeholder height exactly equal to the fixed element's occupied space.
				minHeight: sticky ? `${PLACEHOLDER_HEIGHT}px` : "auto",
				transition: "min-height 0.25s ease",
			}}
		>
			<Paper
				// The Paper is the component that becomes fixed.
				elevation={sticky ? 12 : 8}
				sx={{
					position: sticky ? "fixed" : "relative",
					top: sticky ? FIXED_TOP_OFFSET : "auto", // 16px from the top when fixed

					// Use left: 50% and transform to center the element reliably
					left: sticky ? "50%" : "auto",
					transform: sticky ? "translateX(-50%)" : "none",

					maxWidth: sticky ? fixedMaxWidth : "100%",
					width: sticky ? fixedMaxWidth : "100%", // Explicitly set width when fixed

					display: "grid",
					gridTemplateColumns: {
						xs: "1fr",
						sm: "1fr 1fr",
						md: "2.2fr 1.7fr 1fr auto",
					},
					gridTemplateAreas: {
						xs: `"destination" "dates-guests" "search"`,
						sm: `"destination destination" "dates guests" "search search"`,
						md: `"destination dates guests search"`,
					},
					gap: 0,
					borderRadius: 4,
					overflow: "visible",
					minHeight: PAPER_HEIGHT,

					boxShadow: sticky
						? "0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.12)"
						: "0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)",
				}}
			>
				{/* DESTINATION */}
				<Box
					ref={locationRef}
					sx={{
						gridArea: "destination",
						position: "relative",
						borderRight: { md: "1px solid" },
						borderRightColor: { md: "grey.300" },
					}}
				>
					<Box onClick={() => setOpenLocation(true)} sx={sectionBoxStyles}>
						{/* Replaced Lucide Search with MUI SearchIcon */}
						<SearchIcon sx={iconStyles} fontSize="medium" />
						<Box textAlign="left" sx={{ flexGrow: 1 }}>
							<Typography {...labelStyles}>Where</Typography>
							<TextField
								placeholder="Search destinations"
								variant="standard"
								value={keyword}
								onChange={(e) => setKeyword(e.target.value)}
								onFocus={(e) => {
									e.stopPropagation();
									setOpenLocation(true);
								}}
								onClick={(e) => e.stopPropagation()}
								InputProps={{
									disableUnderline: true,
									sx: { fontSize: "1rem", fontWeight: 600, color: "text.primary" },
								}}
								sx={{
									width: "100%",
									"& input": {
										cursor: "text",
										pointerEvents: "auto",
									},
								}}
							/>
						</Box>
					</Box>

					<LocationTypeahead
						open={openLocation}
						onSelect={(loc) => {
							setKeyword(loc.name ?? "");
							setOpenLocation(false);
						}}
					/>
				</Box>

				{/* DATES */}
				<Box
					ref={dateRef}
					sx={{
						gridArea: { xs: "dates-guests", sm: "dates", md: "dates" },
						borderRight: { md: "1px solid" },
						borderRightColor: { md: "grey.300" },
						borderTop: { xs: "1px solid", sm: "none" },
						borderTopColor: { xs: "grey.300" },
					}}
				>
					<Box
						onClick={() => {
							setTempDateRange(dateRange);
							setIsDateMenuOpen(true);
						}}
						sx={sectionBoxStyles}
					>
						{/* Replaced Lucide Calendar with MUI CalendarIcon */}
						<CalendarIcon sx={iconStyles} fontSize="medium" />
						<Box textAlign="left" sx={{ flexGrow: 1 }}>
							<Typography {...labelStyles}>Check in — Check out</Typography>
							{!dateRange.checkIn ? (
								<Typography variant="body1" fontWeight={600}>
									Add dates
								</Typography>
							) : (
								<Box display="flex" gap={1.5} alignItems="center">
									{/* Check In */}
									<Box>
										<Typography variant="body2" fontWeight={700} lineHeight={1.2}>
											{dateRange.checkIn.getDate()} {dateRange.checkIn.toLocaleDateString("en-US", { month: "short" })} {dateRange.checkIn.getFullYear()}
										</Typography>
										<Typography variant="caption" color="text.secondary" fontSize="0.7rem">
											{dateRange.checkIn.toLocaleDateString("en-US", { weekday: "short" })}
										</Typography>
									</Box>

									{dateRange.checkOut && (
										<>
											<Typography variant="body2" color="text.secondary">
												—
											</Typography>
											{/* Check Out */}
											<Box>
												<Typography variant="body2" fontWeight={700} lineHeight={1.2}>
													{dateRange.checkOut.getDate()} {dateRange.checkOut.toLocaleDateString("en-US", { month: "short" })} {dateRange.checkOut.getFullYear()}
												</Typography>
												<Typography variant="caption" color="text.secondary" fontSize="0.7rem">
													{dateRange.checkOut.toLocaleDateString("en-US", { weekday: "short" })}
												</Typography>
											</Box>
										</>
									)}
								</Box>
							)}
						</Box>
					</Box>

					<DatePickerMenu
						key={`dates-${sticky}`}
						open={isDateMenuOpen}
						anchorEl={dateRef?.current ?? null}
						tempDateRange={tempDateRange}
						monthOffset={monthOffset}
						onMonthPrev={() => setMonthOffset(Math.max(0, monthOffset - 1))}
						onMonthNext={() => setMonthOffset(monthOffset + 1)}
						onDateClick={handleDateClick}
						onClose={handleDateClose}
					/>
				</Box>

				{/* GUESTS */}
				<Box
					ref={guestRef}
					sx={{
						gridArea: { xs: "dates-guests", sm: "guests", md: "guests" },
						borderRight: { md: "1px solid" },
						borderRightColor: { md: "grey.300" },
						borderTop: { xs: "1px solid", sm: "none" },
						borderTopColor: { xs: "grey.300" },
					}}
				>
					<Box onClick={() => setIsGuestMenuOpen(!isGuestMenuOpen)} sx={sectionBoxStyles}>
						<UserIcon sx={iconStyles} fontSize="medium" />
						<Box textAlign="left" sx={{ flexGrow: 1 }}>
							<Typography {...labelStyles}>Who</Typography>
							<Typography variant="body1" fontWeight={600}>
								{/* Removed redundant Markdown bolding from inside JSX */}
								{guests.adults + guests.children} guest
								{guests.adults + guests.children !== 1 && "s"}
								{guests.rooms > 1 && ` · ${guests.rooms} rooms`}
							</Typography>
						</Box>
						<ChevronDownIcon sx={{ opacity: 0.5 }} fontSize="small" />
					</Box>

					<GuestMenu
						key={`guests-${sticky}`}
						open={isGuestMenuOpen}
						anchorEl={guestRef?.current ?? null}
						guests={guests}
						onGuestsChange={setGuests}
						onClose={() => setIsGuestMenuOpen(false)}
					/>
				</Box>

				{/* SEARCH BUTTON */}
				<Box sx={{ gridArea: "search" }}>
					<Button
						fullWidth
						variant="contained"
						color="warning"
						size="large"
						// Replaced Lucide Search with MUI SearchIcon
						startIcon={<SearchIcon />}
						onClick={handleMainSearch}
						sx={{
							height: "100%",
							minHeight: 72,
							borderRadius: {
								xs: 4,
								sm: 4,
								md: "0 16px 16px 0",
							},
							fontWeight: 700,
							fontSize: "1.1rem",
							textTransform: "none",
							boxShadow: sticky ? 6 : 0,
							borderTopLeftRadius: { xs: 4, md: 0 },
							borderBottomLeftRadius: { xs: 4, md: 0 },
						}}
					>
						Search
					</Button>
				</Box>
			</Paper>
		</Box>
	);
};
