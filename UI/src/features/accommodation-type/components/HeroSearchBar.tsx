// HeroSearchBar.tsx
import React from "react";
import { Box, Paper, Button, TextField, Typography } from "@mui/material";
import { Calendar, User, Search, ChevronDown } from "lucide-react";
import type { RefObject } from "react";
import type { DateRange } from "../types/DateRange";
import type { Guests } from "../types/Guest";
import { DatePickerMenu } from "./DatePickerMenu";
import { GuestMenu } from "./GuestMenu";
import { LocationTypeahead } from "./LocationTypeahead";

interface HeroSearchBarProps {
	searchRef?: RefObject<HTMLDivElement>;
	locationRef?: RefObject<HTMLDivElement | null>;
	dateRef?: RefObject<HTMLDivElement | null>;
	guestRef?: RefObject<HTMLDivElement | null>;
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
				position: sticky ? "fixed" : "relative",
				top: sticky ? 16 : "auto",
				left: 0,
				right: 0,
				width: "100%",
				maxWidth: "1200px",
				mx: "auto",
				px: { xs: 2, md: 3 },
				zIndex: sticky ? 1300 : 50,
				transition: "all 0.25s ease",
				bgcolor: "transparent",
				boxShadow: "none",
				borderRadius: sticky ? 4 : 0,
				py: sticky ? 1.5 : 0,
			}}
		>
			<Paper
				elevation={sticky ? 12 : 8}
				sx={{
					display: "grid",
					gridTemplateColumns: {
						xs: "1fr",
						sm: "1fr 1fr",
						md: "2.2fr 1.3fr 1.3fr auto",
					},
					gridTemplateAreas: {
						xs: `"destination" "dates-guests" "search"`,
						sm: `"destination destination" "dates guests" "search search"`,
						md: `"destination dates guests search"`,
					},
					gap: 0,
					borderRadius: 4,
					overflow: "visible",
					minHeight: 72,
					border: "none", // No border
					outline: "none", // No outline
					boxShadow: sticky
						? "0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.12)"
						: "0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)", // Shadow on Paper only
					maxWidth: "100%",
					margin: 0,
					padding: 0,
					"& > *": {
						minWidth: 0,
					},
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
					<Box
						onClick={() => setOpenLocation(true)}
						sx={{
							display: "flex",
							alignItems: "center",
							height: "100%",
							minHeight: 72,
							py: 2,
							px: 3,
							cursor: "pointer",
							"&:hover": { bgcolor: "action.hover" },
						}}
					>
						<Search size={24} style={{ marginRight: 16, opacity: 0.7 }} />
						<Box textAlign="left" sx={{ flexGrow: 1 }}>
							<Typography variant="caption" fontWeight={700} color="text.secondary" display="block">
								Where
							</Typography>
							<TextField
								placeholder="Search destinations"
								variant="standard"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
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
									mt: 0.5,
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
							setQuery(loc.name ?? "");
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
						borderTop: { xs: "1px solid", xsColor: "grey.300" },
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
							minHeight: 72,
							py: 2,
							px: 3,
							borderRadius: 0,
							bgcolor: "transparent",
							"&:hover": { bgcolor: "action.hover" },
						}}
					>
						<Calendar size={24} style={{ marginRight: 16, opacity: 0.7 }} />
						<Box textAlign="left">
							<Typography variant="caption" fontWeight={700} color="text.secondary" display="block">
								Check in — Check out
							</Typography>
							<Typography variant="body1" fontWeight={600}>
								{formatDateRange(dateRange)}
							</Typography>
						</Box>
					</Button>

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
						borderTop: { xs: "1px solid", xsColor: "grey.300" },
					}}
				>
					<Button
						fullWidth
						onClick={() => setIsGuestMenuOpen(!isGuestMenuOpen)}
						sx={{
							justifyContent: "flex-start",
							textTransform: "none",
							height: "100%",
							minHeight: 72,
							py: 2,
							px: 3,
							borderRadius: 0,
							bgcolor: "transparent",
							"&:hover": { bgcolor: "action.hover" },
						}}
					>
						<User size={24} style={{ marginRight: 16, opacity: 0.7 }} />
						<Box textAlign="left" flexGrow={1}>
							<Typography variant="caption" fontWeight={700} color="text.secondary" display="block">
								Who
							</Typography>
							<Typography variant="body1" fontWeight={600}>
								{guests.adults + guests.children} guest{guests.adults + guests.children !== 1 && "s"}
								{guests.rooms > 1 && ` · ${guests.rooms} rooms`}
							</Typography>
						</Box>
						<ChevronDown size={20} />
					</Button>

					<GuestMenu
						key={`guests-${sticky}`}
						open={isGuestMenuOpen}
						anchorEl={guestRef?.current ?? null}
						guests={guests}
						hasPets={hasPets}
						onGuestsChange={setGuests}
						onPetsChange={setHasPets}
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
						startIcon={<Search />}
						sx={{
							height: "100%",
							minHeight: 72,
							borderRadius: { xs: 4, md: 0 },
							fontWeight: 700,
							fontSize: "1.1rem",
							boxShadow: sticky ? 6 : 0,
						}}
					>
						Search
					</Button>
				</Box>
			</Paper>
		</Box>
	);
};
