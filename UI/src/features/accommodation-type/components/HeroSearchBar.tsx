// HeroSearchBar.tsx
import React from "react";
import { Box, Paper, Button, TextField, Typography } from "@mui/material";
import { Calendar, User, Search, ChevronDown } from "lucide-react";
import type { Ref } from "react";
import type { DateRange } from "../types/DateRange";
import type { Guests } from "../types/Guest";
import { DatePickerMenu } from "./DatePickerMenu";
import { GuestMenu } from "./GuestMenu";
import { LocationTypeahead } from "./LocationTypeahead";

interface HeroSearchBarProps {
	searchRef?: Ref<HTMLDivElement>;
	locationRef?: Ref<HTMLDivElement>;
	dateRef?: Ref<HTMLDivElement>;
	guestRef?: Ref<HTMLDivElement>;

	sticky: boolean;
	query: string;
	setQuery: (q: string) => void;
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
	hasPets: boolean;
	setHasPets: (has: boolean) => void;
	isGuestMenuOpen: boolean;
	setIsGuestMenuOpen: (open: boolean) => void;
}

const formatDateRange = (range: DateRange) => {
	if (!range.checkIn) return "Add dates";
	const cin = range.checkIn.toLocaleDateString("en-US", { month: "short", day: "numeric" });
	if (!range.checkOut) return cin;
	const cout = range.checkOut.toLocaleDateString("en-US", { month: "short", day: "numeric" });
	return `${cin} — ${cout}`;
};

export const HeroSearchBar: React.FC<HeroSearchBarProps> = (props) => {
	const {
		searchRef,
		locationRef,
		dateRef,
		guestRef,
		sticky,
		query,
		setQuery,
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
		hasPets,
		setHasPets,
		isGuestMenuOpen,
		setIsGuestMenuOpen,
	} = props;

	const handleDateClick = (date: Date) => {
		if (!tempDateRange.checkIn || tempDateRange.checkOut) {
			setTempDateRange({ checkIn: date, checkOut: null });
		} else if (date < tempDateRange.checkIn!) {
			setTempDateRange({ checkIn: date, checkOut: tempDateRange.checkIn });
		} else {
			setTempDateRange({ ...tempDateRange, checkOut: date });
		}
	};

	const handleDateClose = () => {
		if (tempDateRange.checkIn && tempDateRange.checkOut) {
			setDateRange(tempDateRange);
		}
		setIsDateMenuOpen(false);
	};

	return (
		<Box
			ref={searchRef}
			sx={{
				width: "100%",
				px: 2,
				zIndex: 50,
				position: sticky ? "fixed" : "relative",
				top: sticky ? 10 : "auto",
				left: 0,
				right: 0,
				mx: "auto",
				maxWidth: 1200,
				transition: "top 0.2s ease",
			}}
		>
			<Paper
				elevation={6}
				sx={{
					display: "grid",
					gridTemplateColumns: {
						xs: "1fr", // mobile: stack everything
						sm: "1fr 1fr", // tablet: 2 columns
						md: "2fr 1.2fr 1.2fr auto", // desktop: destination bigger + perfect alignment
					},
					gridTemplateAreas: {
						xs: `
        "destination"
        "dates-guests"
        "search"
      `,
						sm: `
        "destination destination"
        "dates      guests"
        "search     search"
      `,
						md: `"destination dates guests search"`,
					},
					gap: { xs: 1.5, md: 0 },
					alignItems: "stretch",
					borderRadius: 4,
					overflow: "hidden",
					minHeight: { md: 72 },
					backgroundColor: "background.paper",
				}}
			>
				{/* ==================== DESTINATION ==================== */}
				<Box
					ref={locationRef}
					sx={{
						gridArea: "destination",
						position: "relative",
						p: { xs: 1, md: 1.5 },
					}}
				>
					<TextField
						fullWidth
						placeholder="Where are you going?"
						variant="outlined"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						onFocus={() => setOpenLocation(true)}
						InputProps={{
							sx: {
								height: { xs: 56, md: "100%" },
								fontSize: { xs: "1rem", md: "1.1rem" },
								"& .MuiOutlinedInput-notchedOutline": {
									border: { xs: "2px solid", md: "none" },
									borderColor: "warning.main",
									borderRadius: { xs: 3, md: 0 },
								},
								"&:hover .MuiOutlinedInput-notchedOutline": {
									borderColor: "warning.dark",
								},
							},
						}}
					/>
					<LocationTypeahead
						open={openLocation}
						anchorEl={locationRef}
						onSelect={(loc) => {
							setQuery(loc.name ?? "");
							setOpenLocation(false);
						}}
					/>
				</Box>

				{/* ==================== DATES ==================== */}
				<Box
					ref={dateRef}
					sx={{
						gridArea: { xs: "dates-guests", sm: "dates", md: "dates" },
						p: 1.5,
						borderTop: { xs: "1px solid", xsColor: "grey.300" },
						borderLeft: { md: "1px solid", mdColor: "grey.300" },
						bgcolor: { md: "background.default" },
					}}
				>
					<Button
						fullWidth
						onClick={() => {
							setTempDateRange(dateRange);
							setIsDateMenuOpen(true);
						}}
						sx={{
							justifyContent: "flex-start",
							textTransform: "none",
							height: "100%",
							color: "text.primary",
							"&:hover": { bgcolor: "action.hover" },
						}}
					>
						<Calendar size={24} style={{ marginRight: 12 }} />
						<Box textAlign="left">
							<Typography variant="caption" fontWeight={700} display="block">
								Check-in — Check-out
							</Typography>
							<Typography variant="body2" color={dateRange.checkIn ? "text.primary" : "text.secondary"}>
								{formatDateRange(dateRange)}
							</Typography>
						</Box>
					</Button>

					<DatePickerMenu
						open={isDateMenuOpen}
						anchorEl={dateRef.current}
						tempDateRange={tempDateRange}
						monthOffset={monthOffset}
						onMonthPrev={() => setMonthOffset(Math.max(0, monthOffset - 1))}
						onMonthNext={() => setMonthOffset(monthOffset + 1)}
						onDateClick={handleDateClick}
						onClose={handleDateClose}
					/>
				</Box>

				{/* ==================== GUESTS ==================== */}
				<Box
					ref={guestRef}
					sx={{
						gridArea: { xs: "dates-guests", sm: "guests", md: "guests" },
						p: 1.5,
						borderTop: { xs: "1px solid", xsColor: "grey.300" },
						borderLeft: { md: "1px solid", mdColor: "grey.300" },
						bgcolor: { md: "background.default" },
					}}
				>
					<Button
						fullWidth
						onClick={() => setIsGuestMenuOpen(!isGuestMenuOpen)}
						sx={{
							justifyContent: "flex-start",
							textTransform: "none",
							height: "100%",
							color: "text.primary",
							"&:hover": { bgcolor: "action.hover" },
						}}
					>
						<User size={24} style={{ marginRight: 12 }} />
						<Box textAlign="left" flexGrow={1}>
							<Typography variant="caption" fontWeight={700} display="block">
								Guests
							</Typography>
							<Typography variant="body2">
								{guests.adults} adults · {guests.children} children · {guests.rooms} room
								{guests.rooms > 1 && "s"}
							</Typography>
						</Box>
						<ChevronDown size={16} />
					</Button>

					<GuestMenu
						open={isGuestMenuOpen}
						anchorEl={guestRef.current}
						guests={guests}
						hasPets={hasPets}
						onGuestsChange={setGuests}
						onPetsChange={setHasPets}
						onClose={() => setIsGuestMenuOpen(false)}
					/>
				</Box>

				{/* ==================== SEARCH BUTTON ==================== */}
				<Box
					sx={{
						gridArea: "search",
						p: { xs: 1, md: 1.5 },
					}}
				>
					<Button
						fullWidth
						variant="contained"
						color="warning"
						size="large"
						startIcon={<Search />}
						sx={{
							height: "100%",
							borderRadius: { xs: 3, md: 0 },
							fontWeight: 700,
							fontSize: "1.1rem",
							boxShadow: 4,
							"&:hover": { boxShadow: 8 },
						}}
					>
						Search
					</Button>
				</Box>
			</Paper>

			{sticky && <Box sx={{ height: 100 }} />}
		</Box>
	);
};
