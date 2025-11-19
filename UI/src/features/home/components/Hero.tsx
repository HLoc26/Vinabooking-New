import React, { useState, useRef, useEffect } from "react";
import { Box, Typography, Button, TextField, IconButton, Paper, Menu, Divider, Switch, Stack } from "@mui/material";
import { Search, Calendar, User, Minus, Plus, BedDouble, ChevronDown } from "lucide-react";

interface CounterProps {
	label: string;
	value: number;
	onChange: (val: number) => void;
	min?: number;
}

interface DateRange {
	checkIn: Date | null;
	checkOut: Date | null;
}

const Counter: React.FC<CounterProps> = ({ label, value, onChange, min = 0 }) => (
	<Stack direction="row" justifyContent="space-between" alignItems="center" py={1} px={2}>
		<Typography variant="body1">{label}</Typography>
		<Stack direction="row" spacing={1} alignItems="center">
			<IconButton size="small" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>
				<Minus size={16} />
			</IconButton>
			<Typography>{value}</Typography>
			<IconButton size="small" onClick={() => onChange(value + 1)}>
				<Plus size={16} />
			</IconButton>
		</Stack>
	</Stack>
);

// Calendar helpers
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
}> = ({ year, month, label, tempDateRange, onDateClick }) => {
	const daysInMonth = getDaysInMonth(year, month);
	const firstDay = getFirstDayOfMonth(year, month);
	const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
	const blanks = Array.from({ length: firstDay }, (_, i) => i);

	const isSelected = (day: number) => {
		const date = new Date(year, month, day);
		const checkIn = tempDateRange.checkIn;
		const checkOut = tempDateRange.checkOut;
		if (!checkIn) return false;
		return date.toDateString() === checkIn.toDateString() || (checkOut && date.toDateString() === checkOut.toDateString());
	};

	const isInRange = (day: number) => {
		const date = new Date(year, month, day);
		const checkIn = tempDateRange.checkIn;
		const checkOut = tempDateRange.checkOut;
		if (!checkIn || !checkOut) return false;
		return date > checkIn && date < checkOut;
	};

	return (
		<Box width={256}>
			<Typography align="center" fontWeight={700} mb={1}>
				{label}
			</Typography>
			<Box display="grid" gridTemplateColumns="repeat(7, 1fr)" textAlign="center" mb={1}>
				{["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
					<Typography key={d} variant="caption" color="text.secondary">
						{d}
					</Typography>
				))}
			</Box>
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
							onDateClick(new Date(year, month, d));
						}}
						sx={{
							borderRadius: "50%",
							minWidth: 32,
							height: 32,
							bgcolor: isSelected(d) ? "warning.main" : isInRange(d) ? "warning.light" : "transparent",
							color: isSelected(d) ? "white" : "inherit",
							"&:hover": {
								bgcolor: isSelected(d) ? "warning.dark" : "action.hover",
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

export const Hero: React.FC = () => {
	const [isGuestMenuOpen, setIsGuestMenuOpen] = useState(false);
	const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
	const [guests, setGuests] = useState({ adults: 2, children: 0, rooms: 1 });
	const [hasPets, setHasPets] = useState(false);
	const [dateRange, setDateRange] = useState<DateRange>({ checkIn: null, checkOut: null });
	const [tempDateRange, setTempDateRange] = useState<DateRange>({ checkIn: null, checkOut: null });

	const guestRef = useRef<HTMLDivElement>(null);
	const dateRef = useRef<HTMLDivElement>(null);
	const searchRef = useRef<HTMLDivElement>(null);

	const [sticky, setSticky] = useState(false);
	const [originalTop, setOriginalTop] = useState(0);

	useEffect(() => {
		// Calculate and store the original position
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
			// Check if we've scrolled past the original position
			setSticky(scrollTop > originalTop - 80);
		};
		window.addEventListener("scroll", handleScroll);

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [originalTop]);

	const handleDateClick = (date: Date) => {
		if (!tempDateRange.checkIn || (tempDateRange.checkIn && tempDateRange.checkOut)) {
			// First click or reset
			setTempDateRange({ checkIn: date, checkOut: null });
		} else {
			// Second click
			if (date < tempDateRange.checkIn) {
				setTempDateRange({ checkIn: date, checkOut: tempDateRange.checkIn });
			} else {
				setTempDateRange({ ...tempDateRange, checkOut: date });
			}
		}
	};

	const handleDateMenuOpen = () => {
		// Initialize temp date range with current confirmed dates
		setTempDateRange(dateRange);
		setIsDateMenuOpen(true);
	};

	const handleDateMenuClose = () => {
		// Only confirm if both dates are selected
		if (tempDateRange.checkIn && tempDateRange.checkOut) {
			setDateRange(tempDateRange);
		}
		setIsDateMenuOpen(false);
	};

	const formatDateRange = () => {
		if (!dateRange.checkIn) return "Add dates for prices";
		const checkInStr = dateRange.checkIn.toLocaleDateString("en-US", { month: "short", day: "numeric" });
		if (!dateRange.checkOut) return checkInStr;
		const checkOutStr = dateRange.checkOut.toLocaleDateString("en-US", { month: "short", day: "numeric" });
		return `${checkInStr} — ${checkOutStr}`;
	};

	const today = new Date();
	const currentYear = today.getFullYear();
	const currentMonth = today.getMonth();
	const nextMonthDate = new Date(currentYear, currentMonth + 1);

	return (
		<Box position="relative" height={{ xs: 600, lg: 700 }}>
			{/* Hero Background */}
			<Box
				position="absolute"
				inset={0}
				sx={{
					backgroundImage: "url(https://picsum.photos/600/700)",
					backgroundSize: "cover",
					backgroundPosition: "center",
				}}
			/>
			<Box position="absolute" inset={0} bgcolor="rgba(0,0,0,0.4)" sx={{ backdropFilter: "blur(2px)" }} />

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
					position: sticky ? "fixed" : "absolute",
					top: sticky ? 80 : 280,
					left: 0,
					right: 0,
					mx: "auto",
					maxWidth: 1200,
					transition: "all 0.3s ease",
				}}
			>
				<Paper elevation={6} sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, borderRadius: 2, overflow: "hidden" }}>
					{/* Destination */}
					<Box flex={1} p={1}>
						<TextField
							fullWidth
							placeholder="Where are you going?"
							variant="outlined"
							InputProps={{
								startAdornment: <BedDouble size={24} style={{ marginRight: 8 }} />,
							}}
						/>
					</Box>

					{/* Date Picker */}
					<Box flex={1} p={1} ref={dateRef}>
						<Button fullWidth onClick={handleDateMenuOpen} sx={{ justifyContent: "flex-start", textTransform: "none" }}>
							<Calendar size={24} style={{ marginRight: 8 }} />
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
							MenuListProps={{
								onClick: (e) => e.stopPropagation(),
							}}
						>
							<Box display="flex" p={2} onClick={(e) => e.stopPropagation()}>
								<CalendarMonth
									year={currentYear}
									month={currentMonth}
									label={today.toLocaleString("default", { month: "long", year: "numeric" })}
									tempDateRange={tempDateRange}
									onDateClick={handleDateClick}
								/>
								<CalendarMonth
									year={nextMonthDate.getFullYear()}
									month={nextMonthDate.getMonth()}
									label={nextMonthDate.toLocaleString("default", { month: "long", year: "numeric" })}
									tempDateRange={tempDateRange}
									onDateClick={handleDateClick}
								/>
							</Box>
						</Menu>
					</Box>

					{/* Guests Picker */}
					<Box flex={1} p={1} ref={guestRef}>
						<Button fullWidth onClick={() => setIsGuestMenuOpen(!isGuestMenuOpen)} sx={{ justifyContent: "flex-start", textTransform: "none" }}>
							<User size={24} style={{ marginRight: 8 }} />
							<Box textAlign="left" flexGrow={1}>
								<Typography variant="caption" fontWeight={700}>
									Guests
								</Typography>
								<Typography variant="body2">
									{guests.adults} adults · {guests.children} children · {guests.rooms} room
								</Typography>
							</Box>
							<ChevronDown size={16} />
						</Button>
						<Menu
							open={isGuestMenuOpen}
							onClose={() => setIsGuestMenuOpen(false)}
							anchorEl={guestRef.current}
							anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
							disableAutoFocusItem
							MenuListProps={{
								onClick: (e) => e.stopPropagation(),
							}}
						>
							<Box p={2} onClick={(e) => e.stopPropagation()}>
								<Counter label="Adults" value={guests.adults} onChange={(v) => setGuests({ ...guests, adults: v })} min={1} />
								<Counter label="Children" value={guests.children} onChange={(v) => setGuests({ ...guests, children: v })} />
								<Counter label="Rooms" value={guests.rooms} onChange={(v) => setGuests({ ...guests, rooms: v })} min={1} />
								<Divider sx={{ my: 1 }} />
								<Stack direction="row" alignItems="center" justifyContent="space-between">
									<Typography>Traveling with pets?</Typography>
									<Switch checked={hasPets} onChange={() => setHasPets(!hasPets)} />
								</Stack>
							</Box>
						</Menu>
					</Box>

					{/* Search Button */}
					<Box p={1}>
						<Button fullWidth variant="contained" color="warning" startIcon={<Search />} sx={{ height: "100%" }}>
							Search
						</Button>
					</Box>
				</Paper>
			</Box>
		</Box>
	);
};

export default Hero;
