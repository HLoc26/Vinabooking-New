import React, { useState, useRef, useEffect } from "react";
import { Box, Typography, Button, TextField, IconButton, Paper, Menu, Stack } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PersonIcon from "@mui/icons-material/Person";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import BedIcon from "@mui/icons-material/Bed";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

interface CounterProps {
	label: string;
	value: number;
	onChange: (val: number) => void;
	min?: number;
}

export interface DateRange {
	checkIn: Date | null;
	checkOut: Date | null;
}

const Counter: React.FC<CounterProps> = ({ label, value, onChange, min = 0 }) => (
	<Stack direction="row" justifyContent="space-between" alignItems="center" py={1} px={2}>
		<Typography variant="body1">{label}</Typography>
		<Stack direction="row" spacing={1} alignItems="center">
			<IconButton size="small" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>
				<RemoveIcon fontSize="small" />
			</IconButton>
			<Typography>{value}</Typography>
			<IconButton size="small" onClick={() => onChange(value + 1)}>
				<AddIcon fontSize="small" />
			</IconButton>
		</Stack>
	</Stack>
);

/* -------------------------------------------
   Calendar utils
-------------------------------------------- */
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => {
	const day = new Date(year, month, 1).getDay();
	return day === 0 ? 6 : day - 1;
};

const CalendarMonth: React.FC<{
	year: number;
	month: number;
	label: string;
	tempDateRange: DateRange;
	onDateClick: (date: Date) => void;
	minDate?: Date;
	maxDate?: Date;
}> = ({ year, month, label, tempDateRange, onDateClick, minDate, maxDate }) => {
	const daysInMonth = getDaysInMonth(year, month);
	const firstDay = getFirstDayOfMonth(year, month);
	const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
	const blanks = Array.from({ length: firstDay }, (_, i) => i);

	const isSelected = (day: number) => {
		const date = new Date(year, month, day);
		const { checkIn, checkOut } = tempDateRange;
		if (!checkIn) return false;
		return date.toDateString() === checkIn.toDateString() || (checkOut && date.toDateString() === checkOut.toDateString());
	};

	const isInRange = (day: number) => {
		const date = new Date(year, month, day);
		const { checkIn, checkOut } = tempDateRange;
		if (!checkIn || !checkOut) return false;
		return date > checkIn && date < checkOut;
	};

	const isDisabled = (day: number) => {
		const date = new Date(year, month, day);
		if (minDate && date < minDate) return true;
		if (maxDate && date > maxDate) return true;
		return false;
	};

	return (
		<Box width={256}>
			<Typography align="center" fontWeight={700} mb={1}>
				{label}
			</Typography>

			{/* Weekdays */}
			<Box display="grid" gridTemplateColumns="repeat(7, 1fr)" textAlign="center" mb={1}>
				{["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
					<Typography key={d} variant="caption" color="text.secondary">
						{d}
					</Typography>
				))}
			</Box>

			{/* Days */}
			<Box display="grid" gridTemplateColumns="repeat(7, 1fr)" textAlign="center" gap={0.5}>
				{blanks.map((b) => (
					<Box key={`blank-${b}`} />
				))}

				{days.map((d) => (
					<Button
						key={d}
						variant="text"
						onClick={(e) => {
							e.stopPropagation();
							if (!isDisabled(d)) onDateClick(new Date(year, month, d));
						}}
						disabled={isDisabled(d)}
						sx={{
							borderRadius: "50%",
							minWidth: 32,
							height: 32,
							bgcolor: isSelected(d) ? "warning.main" : isInRange(d) ? "warning.light" : "transparent",
							color: isSelected(d) ? "white" : "inherit",
							"&:hover": {
								bgcolor: isSelected(d) ? "warning.dark" : !isDisabled(d) ? "action.hover" : "transparent",
							},
						}}
					>
						{d}
					</Button>
				))}
			</Box>
		</Box>
	);
};

/* -------------------------------------------
   MAIN HERO COMPONENT
-------------------------------------------- */
export const Hero: React.FC = () => {
	const [isGuestMenuOpen, setIsGuestMenuOpen] = useState(false);
	const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);

	const [guests, setGuests] = useState({ adults: 2, children: 0, rooms: 1 });

	const [dateRange, setDateRange] = useState<DateRange>({ checkIn: null, checkOut: null });
	const [tempDateRange, setTempDateRange] = useState<DateRange>({ checkIn: null, checkOut: null });

	const guestRef = useRef<HTMLDivElement>(null);
	const dateRef = useRef<HTMLDivElement>(null);
	const searchRef = useRef<HTMLDivElement>(null);

	/* Sticky search bar logic */
	const [sticky, setSticky] = useState(false);
	const [originalTop, setOriginalTop] = useState(0);

	useEffect(() => {
		if (searchRef.current && originalTop === 0) {
			const rect = searchRef.current.getBoundingClientRect();
			const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
			setOriginalTop(rect.top + scrollTop);
		}
	}, [originalTop]);

	useEffect(() => {
		const handleScroll = () => {
			if (!searchRef.current || originalTop === 0) return;
			const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
			setSticky(scrollTop > originalTop - 80);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, [originalTop]);

	/* Date selection */
	const handleDateClick = (date: Date) => {
		if (!tempDateRange.checkIn || (tempDateRange.checkIn && tempDateRange.checkOut)) {
			setTempDateRange({ checkIn: date, checkOut: null });
		} else {
			if (date < tempDateRange.checkIn) setTempDateRange({ checkIn: date, checkOut: tempDateRange.checkIn });
			else setTempDateRange({ ...tempDateRange, checkOut: date });
		}
	};

	const handleDateMenuOpen = () => {
		setTempDateRange(dateRange);
		setIsDateMenuOpen(true);
	};

	const handleDateMenuClose = () => {
		if (tempDateRange.checkIn && tempDateRange.checkOut) setDateRange(tempDateRange);
		setIsDateMenuOpen(false);
	};

	const formatDateRange = () => {
		if (!dateRange.checkIn) return "Add dates for prices";
		const checkInStr = dateRange.checkIn.toLocaleDateString("en-US", { month: "short", day: "numeric" });
		if (!dateRange.checkOut) return checkInStr;
		const checkOutStr = dateRange.checkOut.toLocaleDateString("en-US", { month: "short", day: "numeric" });
		return `${checkInStr} — ${checkOutStr}`;
	};

	/* -------- Calendar Navigation (2 months only) -------- */
	const today = new Date();
	const maxDate = new Date(today.getFullYear(), today.getMonth() + 12, today.getDate());

	// This month index relative to current date
	const [monthOffset, setMonthOffset] = useState(0);

	// Always show 2 months
	const visibleMonths = [new Date(today.getFullYear(), today.getMonth() + monthOffset), new Date(today.getFullYear(), today.getMonth() + monthOffset + 1)];

	const handlePrev = () => {
		setMonthOffset((prev) => Math.max(0, prev - 1)); // prevent going before today
	};

	const handleNext = () => {
		setMonthOffset((prev) => prev + 1);
	};

	return (
		<Box position="relative" height={{ xs: 600, lg: 700 }}>
			{/* Background */}
			<Box
				position="absolute"
				sx={{
					inset: 0,
					backgroundImage: "url(https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop)",
					backgroundSize: "cover",
					backgroundPosition: "center",
					zIndex: 0,
				}}
			/>

			{/* Overlay */}
			<Box
				position="absolute"
				sx={{
					inset: 0,
					bgcolor: "rgba(0,0,0,0.4)",
					backdropFilter: "blur(2px)",
					zIndex: 1,
				}}
			/>

			{/* Hero Text */}
			<Box position="relative" zIndex={5} textAlign="center" px={2} pt={8}>
				<Typography variant="h2" fontWeight={700} color="white" mb={2}>
					Find your booking with{" "}
					<Box component="span" color="orange.400">
						Vinabooking
					</Box>
				</Typography>
				<Typography variant="h6" color="white" mb={4}>
					Experience the finest accommodations across Vietnam's most scenic destinations.
				</Typography>
			</Box>

			{/* Search Bar */}
			<Box
				ref={searchRef}
				sx={{
					width: "100%",
					px: 2,
					zIndex: 10,
					position: sticky ? "fixed" : "relative",
					top: sticky ? 10 : "auto",
					left: 0,
					right: 0,
					mx: "auto",
					maxWidth: 2000,
					transition: "top 0.2s ease",
				}}
			>
				<Paper
					elevation={6}
					sx={{
						display: "flex",
						flexDirection: { xs: "column", lg: "row" },
						borderRadius: 2,
						overflow: "hidden",
					}}
				>
					{/* Destination */}
					<Box flex={1} p={1}>
						<TextField
							fullWidth
							placeholder="Where are you going?"
							variant="outlined"
							InputProps={{
								startAdornment: <BedIcon sx={{ mr: 1 }} />,
							}}
						/>
					</Box>

					{/* Date Picker */}
					<Box flex={1} p={1} ref={dateRef}>
						<Button fullWidth onClick={handleDateMenuOpen} sx={{ justifyContent: "flex-start", textTransform: "none" }}>
							<CalendarMonthIcon sx={{ mr: 1 }} />
							<Box textAlign="left">
								<Typography variant="caption" fontWeight={700}>
									Check-in — Check-out
								</Typography>
								<Typography variant="body2">{formatDateRange()}</Typography>
							</Box>
						</Button>

						<Menu
							open={isDateMenuOpen}
							onClose={handleDateMenuClose}
							anchorEl={dateRef.current}
							anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
							disableAutoFocusItem
							MenuListProps={{ onClick: (e) => e.stopPropagation() }}
						>
							{/* Month Navigation Header */}
							<Box display="flex" justifyContent="space-between" alignItems="center" px={2} py={1}>
								<IconButton onClick={handlePrev} disabled={monthOffset === 0}>
									<ChevronLeftIcon />
								</IconButton>

								<Typography fontWeight={700}>Select Dates</Typography>

								<IconButton onClick={handleNext}>
									<ChevronRightIcon />
								</IconButton>
							</Box>

							{/* Calendar Grid */}
							<Box display="flex" p={2} gap={2} onClick={(e) => e.stopPropagation()}>
								{visibleMonths.map((d, i) => (
									<CalendarMonth
										key={i}
										year={d.getFullYear()}
										month={d.getMonth()}
										label={d.toLocaleString("default", {
											month: "long",
											year: "numeric",
										})}
										tempDateRange={tempDateRange}
										onDateClick={handleDateClick}
										minDate={today}
										maxDate={maxDate}
									/>
								))}
							</Box>
						</Menu>
					</Box>

					{/* Guests Picker */}
					<Box flex={1} p={1} ref={guestRef}>
						<Button fullWidth onClick={() => setIsGuestMenuOpen(!isGuestMenuOpen)} sx={{ justifyContent: "flex-start", textTransform: "none" }}>
							<PersonIcon sx={{ mr: 1 }} />
							<ExpandMoreIcon fontSize="small" />
							<Box textAlign="left" flexGrow={1}>
								<Typography variant="caption" fontWeight={700}>
									Guests
								</Typography>
								<Typography variant="body2">
									{guests.adults} adults · {guests.children} children · {guests.rooms} room
								</Typography>
							</Box>
							<ExpandMoreIcon />
						</Button>

						<Menu
							open={isGuestMenuOpen}
							onClose={() => setIsGuestMenuOpen(false)}
							anchorEl={guestRef.current}
							anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
							disableAutoFocusItem
							MenuListProps={{ onClick: (e) => e.stopPropagation() }}
						>
							<Box p={2} onClick={(e) => e.stopPropagation()}>
								<Counter label="Adults" value={guests.adults} onChange={(v) => setGuests({ ...guests, adults: v })} min={1} />
								<Counter label="Children" value={guests.children} onChange={(v) => setGuests({ ...guests, children: v })} />
								<Counter label="Rooms" value={guests.rooms} onChange={(v) => setGuests({ ...guests, rooms: v })} min={1} />
							</Box>
						</Menu>
					</Box>

					{/* Search Button */}
					<Box p={1}>
						<Button fullWidth variant="contained" color="warning" startIcon={<SearchIcon />} sx={{ height: "100%" }}>
							Search
						</Button>
					</Box>
				</Paper>
			</Box>
			{sticky && <Box sx={{ height: 100 }} />}
		</Box>
	);
};

export default Hero;
