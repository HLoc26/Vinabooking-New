import React, { useState, useRef, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { HeroSearchBar } from "./HeroSearchBar"; // Your original component with typeahead
import { useLocationSearch } from "../../../context/SearchContext/useLocationSearch";
import type { DateRange } from "../../accommodation-type/types/DateRange";
import type { Guests } from "../../accommodation-type/types/Guest";

// Helper function to get default date range
const getDefaultDateRange = (): DateRange => {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const checkOut = new Date(today);
	checkOut.setDate(today.getDate() + 2);

	return {
		checkIn: today,
		checkOut: checkOut,
	};
};

export const Hero: React.FC = () => {
	const { query, updateQuery } = useLocationSearch();

	// Local state for UI - Initialize with default dates
	const [guests, setGuests] = useState<Guests>({ adults: 2, children: 0, rooms: 1 });
	const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());
	const [tempDateRange, setTempDateRange] = useState<DateRange>(getDefaultDateRange());
	const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
	const [isGuestMenuOpen, setIsGuestMenuOpen] = useState(false);
	const [monthOffset, setMonthOffset] = useState(0);
	const [openLocation, setOpenLocation] = useState(false);

	const locationRef = useRef<HTMLDivElement>(null!);
	const dateRef = useRef<HTMLDivElement>(null!);
	const guestRef = useRef<HTMLDivElement>(null!);
	const searchRef = useRef<HTMLDivElement>(null!);

	const [sticky, setSticky] = useState(false);

	// Sync local state to context when changed
	useEffect(() => {
		updateQuery({
			adults: guests.adults,
			children: guests.children,
			rooms: guests.rooms,
		});
	}, [guests, updateQuery]);

	useEffect(() => {
		updateQuery({
			checkIn: dateRange.checkIn || undefined,
			checkOut: dateRange.checkOut || undefined,
		});
	}, [dateRange, updateQuery]);

	// Sticky scroll logic
	useEffect(() => {
		if (!searchRef.current) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				setSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0);
			},
			{
				threshold: 0,
				rootMargin: "-80px 0px 0px 0px",
			}
		);

		observer.observe(searchRef.current);
		return () => observer.disconnect();
	}, []);

	return (
		<Box position="relative" sx={{ minHeight: { xs: 600, lg: 700 }, display: "flex", flexDirection: "column" }}>
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
					background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.5) 100%)",
					zIndex: 1,
				}}
			/>

			{/* Hero Text */}
			<Box position="relative" zIndex={5} textAlign="center" px={2} mt={8} maxWidth={900} mx="auto" pb={12}>
				<Typography
					variant="h2"
					fontWeight={800}
					color="white"
					mb={3}
					sx={{
						fontSize: { xs: "2.5rem", md: "3.5rem", lg: "4rem" },
						textShadow: "0px 4px 12px rgba(0,0,0,0.3)",
						lineHeight: 1.1,
					}}
				>
					Find your perfect booking with{" "}
					<Box component="span" color="secondary.main" sx={{ position: "relative", display: "inline-block" }}>
						Vinabooking
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
					</Box>
				</Typography>
				<Typography variant="h6" color="rgba(255,255,255,0.9)" fontWeight={400}>
					Experience the finest accommodations across Vietnam's most scenic destinations.
				</Typography>
			</Box>

			{/* Search Bar - Using your original HeroSearchBar with typeahead */}
			<HeroSearchBar
				searchRef={searchRef}
				sticky={sticky}
				keyword={query.keyword || ""}
				setKeyword={(keyword) => updateQuery({ keyword })}
				openLocation={openLocation}
				setOpenLocation={setOpenLocation}
				locationRef={locationRef}
				dateRef={dateRef}
				guestRef={guestRef}
				dateRange={dateRange}
				tempDateRange={tempDateRange}
				setTempDateRange={setTempDateRange}
				setDateRange={setDateRange}
				isDateMenuOpen={isDateMenuOpen}
				setIsDateMenuOpen={setIsDateMenuOpen}
				monthOffset={monthOffset}
				setMonthOffset={setMonthOffset}
				guests={guests}
				setGuests={setGuests}
				isGuestMenuOpen={isGuestMenuOpen}
				setIsGuestMenuOpen={setIsGuestMenuOpen}
			/>
		</Box>
	);
};

export default Hero;
