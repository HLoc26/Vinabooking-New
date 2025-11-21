import React, { useState, useRef, useEffect } from "react";
import { Box, Typography, Button, TextField, IconButton, Paper, Menu, Divider, Switch, Stack } from "@mui/material";
import { Calendar, User, Minus, Plus, BedDouble, ChevronDown } from "lucide-react";
import { EAccommodationType } from "../../../types/acommodation";
import type { DateRange } from "../services/types/DateRange";
import { ACCOMMODATION_LABELS, ACCOMMODATION_QUOTES, ACCOMMODATION_HERO_IMAGES } from "../constants/Const";

interface HeroProps {
	currentType: EAccommodationType;
	onTypeChange: (type: EAccommodationType) => void;
}

interface CounterProps {
	label: string;
	value: number;
	onChange: (val: number) => void;
	min?: number;
}

const Counter: React.FC<CounterProps> = ({ label, value, onChange, min = 0 }) => (
	<Stack direction="row" justifyContent="space-between" alignItems="center" py={1} px={2}>
		<Typography variant="body2" fontWeight={500}>
			{label}
		</Typography>
		<Stack direction="row" spacing={1} alignItems="center">
			<IconButton size="small" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>
				<Minus size={14} />
			</IconButton>
			<Typography variant="body2" fontWeight="bold" sx={{ minWidth: 20, textAlign: "center" }}>
				{value}
			</Typography>
			<IconButton size="small" onClick={() => onChange(value + 1)}>
				<Plus size={14} />
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
		<Box width={280} p={1}>
			<Typography align="center" fontWeight={700} mb={2} variant="subtitle2">
				{label}
			</Typography>
			<Box display="grid" gridTemplateColumns="repeat(7, 1fr)" textAlign="center" mb={1}>
				{["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
					<Typography key={d} variant="caption" color="text.secondary" fontWeight="bold">
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
							p: 0,
							fontSize: "0.85rem",
							bgcolor: isSelected(d) ? "primary.main" : isInRange(d) ? "primary.light" : "transparent",
							color: isSelected(d) ? "white" : isInRange(d) ? "primary.contrastText" : "inherit",
							"&:hover": {
								bgcolor: isSelected(d) ? "primary.dark" : "action.hover",
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

export const Hero: React.FC<HeroProps> = ({ currentType }) => {
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
		if (!dateRange.checkIn) return "Add dates";
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
		<Box position="relative" sx={{ minHeight: { xs: 650, lg: 750 }, display: "flex", flexDirection: "column" }}>
			{/* Background Images - Stacked for smooth opacity transition */}
			{Object.values(EAccommodationType).map((type) => (
				<Box
					key={type}
					position="absolute"
					sx={{
						inset: 0,
						backgroundImage: `url(${ACCOMMODATION_HERO_IMAGES[type]})`,
						backgroundSize: "cover",
						backgroundPosition: "center",
						zIndex: 0,
						opacity: currentType === type ? 1 : 0,
						transition: "opacity 1.2s ease-in-out",
					}}
				/>
			))}

			{/* Overlay */}
			<Box
				position="absolute"
				sx={{
					inset: 0,
					background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.5) 100%)",
					zIndex: 1,
				}}
			/>

			{/* Accommodation Type Selector (Pills) */}
			<Box position="relative" zIndex={5} pt={4} display="flex" justifyContent="center">
				{/* <Paper
					elevation={0}
					sx={{
						bgcolor: "rgba(255,255,255,0.15)",
						backdropFilter: "blur(10px)",
						borderRadius: 8,
						p: 1,
						display: "flex",
						gap: 1,
						flexWrap: "nowrap", // ❗ prevent wrapping
						overflowX: "auto", // ❗ allow scroll instead of wrapping
						scrollbarWidth: "none", // hide scrollbar (Firefox)
						"&::-webkit-scrollbar": {
							// hide scrollbar (Chrome)
							display: "none",
						},
						maxWidth: "95%",
					}}
				>
					{Object.values(EAccommodationType)
						.slice(0, 20)
						.map((type) => {
							const isSelected = currentType === type;
							return (
								<Chip
									key={type}
									label={ACCOMMODATION_LABELS[type]}
									onClick={() => onTypeChange(type)}
									sx={{
										bgcolor: isSelected ? "white" : "transparent",
										color: isSelected ? "primary.main" : "white",
										fontWeight: isSelected ? 700 : 500,
										cursor: "pointer",
										"&:hover": {
											bgcolor: isSelected ? "white" : "rgba(255,255,255,0.2)",
										},
										transition: "all 0.2s ease",
									}}
								/>
							);
						})}
				</Paper> */}
			</Box>

			{/* Hero Text */}
			<Box
				position="relative"
				zIndex={5}
				textAlign="center"
				px={2}
				mt={8}
				maxWidth={900}
				mx="auto"
				pb={8} // ⭐ Add this (try 8 → 12)
			>
				<Typography
					variant="h2"
					fontWeight={800}
					color="white"
					mb={3}
					sx={{
						fontSize: { xs: "2.5rem", md: "3.5rem", lg: "4rem" },
						textShadow: "0px 4px 12px rgba(0,0,0,0.3)",
						lineHeight: 1.1, // ⭐ keeps text tight + prevents drop
					}}
				>
					Find the perfect{" "}
					<Box component="span" color="secondary.main" sx={{ position: "relative", display: "inline-block" }}>
						{ACCOMMODATION_LABELS[currentType]}
						<Box
							component="svg"
							viewBox="0 0 200 9"
							sx={{
								position: "absolute",
								bottom: -5,
								left: 0,
								width: "100%",
								height: 12,
								fill: "none",
								stroke: "#f97316",
								strokeWidth: 4,
								opacity: 0.8,
							}}
						>
							<path d="M2.00025 6.99997C38.5002 3.00004 150.001 -2.00002 198 3.99999" />
						</Box>
					</Box>{" "}
					<br className="hidden md:block" />
					on VinaBooking.com
				</Typography>
				<Typography variant="h6" color="rgba(255,255,255,0.9)" mb={4} fontWeight={400}>
					{ACCOMMODATION_QUOTES[currentType]}
				</Typography>
			</Box>

			{/* Search Bar */}
			<Box
				ref={searchRef}
				sx={{
					width: "100%",
					px: 2,
					zIndex: 50,
					position: sticky ? "fixed" : "absolute",
					top: sticky ? 20 : 420, // Adjust top based on content
					left: 0,
					right: 0,
					mx: "auto",
					maxWidth: 1100,
					transition: "all 0.3s ease",
				}}
			>
				<Paper
					elevation={sticky ? 8 : 24}
					sx={{
						display: "flex",
						flexDirection: { xs: "column", md: "row" },
						borderRadius: 3,
						overflow: "hidden",
						p: 1,
						bgcolor: "rgba(255,255,255,0.98)",
						border: "1px solid rgba(255,255,255,1)",
					}}
				>
					{/* Destination */}
					<Box flex={1.5} p={1} position="relative">
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								height: "100%",
								borderRadius: 2,
								px: 2,
								"&:hover": { bgcolor: "grey.50" },
								cursor: "text",
							}}
						>
							<BedDouble size={20} className="text-gray-500 mr-3" />
							<Box width="100%">
								<Typography variant="caption" color="text.secondary" fontWeight={700} display="block"></Typography>
								<TextField
									fullWidth
									placeholder="Where are you going?"
									variant="standard"
									InputProps={{ disableUnderline: true }}
									sx={{
										ml: 2,
										"& input": { p: 0, fontWeight: 500 },
									}}
								/>{" "}
							</Box>
						</Box>
					</Box>

					<Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" }, my: 1 }} />
					<Divider orientation="horizontal" flexItem sx={{ display: { xs: "block", md: "none" }, mx: 2 }} />

					{/* Date Picker */}
					<Box flex={1.2} p={1} ref={dateRef}>
						<Button
							fullWidth
							onClick={handleDateMenuOpen}
							sx={{
								justifyContent: "flex-start",
								textTransform: "none",
								height: "100%",
								px: 2,
								borderRadius: 2,
								"&:hover": { bgcolor: "grey.50" },
							}}
						>
							<Calendar size={20} className="text-gray-500 mr-3" />
							<Box textAlign="left">
								<Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
									Check-in — Check-out
								</Typography>
								<Typography variant="body2" color="text.primary" fontWeight={500}>
									{formatDateRange()}
								</Typography>
							</Box>
						</Button>
						<Menu
							open={isDateMenuOpen}
							onClose={handleDateMenuClose}
							anchorEl={dateRef.current}
							anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
							transformOrigin={{ vertical: "top", horizontal: "left" }}
							disableAutoFocusItem
							MenuListProps={{ onClick: (e) => e.stopPropagation(), sx: { p: 0 } }}
							PaperProps={{ sx: { borderRadius: 3, mt: 2, boxShadow: 6 } }}
						>
							<Box display="flex" flexDirection={{ xs: "column", sm: "row" }} p={2} onClick={(e) => e.stopPropagation()}>
								<CalendarMonth
									year={currentYear}
									month={currentMonth}
									label={today.toLocaleString("default", { month: "long", year: "numeric" })}
									tempDateRange={tempDateRange}
									onDateClick={handleDateClick}
								/>
								<Box sx={{ borderLeft: "1px solid #eee", mx: 2, display: { xs: "none", sm: "block" } }} />
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

					<Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" }, my: 1 }} />
					<Divider orientation="horizontal" flexItem sx={{ display: { xs: "block", md: "none" }, mx: 2 }} />

					{/* Guests Picker */}
					<Box flex={1} p={1} ref={guestRef}>
						<Button
							fullWidth
							onClick={() => setIsGuestMenuOpen(!isGuestMenuOpen)}
							sx={{
								justifyContent: "flex-start",
								textTransform: "none",
								height: "100%",
								px: 2,
								borderRadius: 2,
								"&:hover": { bgcolor: "grey.50" },
							}}
						>
							<User size={20} className="text-gray-500 mr-3" />
							<Box textAlign="left" flexGrow={1}>
								<Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
									Guests
								</Typography>
								<Typography variant="body2" color="text.primary" fontWeight={500} noWrap>
									{guests.adults} adults · {guests.rooms} room
								</Typography>
							</Box>
							<ChevronDown size={16} className="text-gray-400" />
						</Button>
						<Menu
							open={isGuestMenuOpen}
							onClose={() => setIsGuestMenuOpen(false)}
							anchorEl={guestRef.current}
							anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
							transformOrigin={{ vertical: "top", horizontal: "left" }}
							disableAutoFocusItem
							MenuListProps={{ onClick: (e) => e.stopPropagation(), sx: { p: 1, width: 300 } }}
							PaperProps={{ sx: { borderRadius: 3, mt: 2, boxShadow: 6 } }}
						>
							<Box onClick={(e) => e.stopPropagation()}>
								<Counter label="Adults" value={guests.adults} onChange={(v) => setGuests({ ...guests, adults: v })} min={1} />
								<Counter label="Children" value={guests.children} onChange={(v) => setGuests({ ...guests, children: v })} />
								<Counter label="Rooms" value={guests.rooms} onChange={(v) => setGuests({ ...guests, rooms: v })} min={1} />
								<Divider sx={{ my: 1 }} />
								<Stack direction="row" alignItems="center" justifyContent="space-between" px={2} py={1}>
									<Typography variant="body2">Traveling with pets?</Typography>
									<Switch size="small" checked={hasPets} onChange={() => setHasPets(!hasPets)} />
								</Stack>
							</Box>
						</Menu>
					</Box>

					{/* Search Button */}
					<Box p={1} flex={0.6}>
						<Button
							fullWidth
							variant="contained"
							color="primary"
							size="large"
							sx={{
								height: "100%",
								boxShadow: "none",
								fontSize: "1rem",
								borderRadius: 2,
								minHeight: 48,
							}}
						>
							Search
						</Button>
					</Box>
				</Paper>
			</Box>
		</Box>
	);
};
