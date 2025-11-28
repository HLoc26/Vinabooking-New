import React, { useCallback, useRef, useState } from "react";
import { Box, Paper, Button, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import SearchIcon from "@mui/icons-material/SearchRounded";
import CalendarIcon from "@mui/icons-material/CalendarMonthRounded";
import UserIcon from "@mui/icons-material/PersonRounded";
import ChevronDownIcon from "@mui/icons-material/KeyboardArrowDownRounded";

import type { Guests } from "../../types/Guest";

import { DatePickerMenu } from "./DatePickerMenu";
import { GuestMenu } from "./GuestMenu";
import { LocationTypeahead } from "./LocationTypeahead";
import useSearchContext from "../../context/SearchContext/hook";
import { useSticky } from "../../hooks/useSticky";
import { buildSearchParams } from "../../utils/search";

// Define the required fixed dimensions
const PAPER_HEIGHT = 72; // The minimum height of the Paper (the sticky bar content)
const FIXED_TOP_OFFSET = 16; // The 'top' value when fixed (16px)

// Placeholder Height = PAPER_HEIGHT + FIXED_TOP_OFFSET
const PLACEHOLDER_HEIGHT = PAPER_HEIGHT + FIXED_TOP_OFFSET;

interface SectionBoxIcon {
	Icon: React.ElementType;
	RightIcon?: React.ReactNode;
	label: string;
	children: React.ReactNode;
	onClick: () => void;
}

const SectionBox: React.FC<SectionBoxIcon> = ({ Icon, RightIcon, label, children, onClick }) => (
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
		<Icon sx={{ mr: 2, opacity: 0.7 }} /> {/* style icon ngay đây */}
		<Box textAlign="left" sx={{ flexGrow: 1 }}>
			<Typography variant={"caption"} fontWeight={700} color={"text.secondary"} display={"block"} mb={0.5}>
				{label}
			</Typography>
			{children}
		</Box>
		{RightIcon && <Box sx={{ ml: 1, display: "flex", alignItems: "center" }}>{RightIcon}</Box>}
	</Box>
);

export const HeroSearchBar: React.FC = () => {
	const { ref: searchRef, sticky } = useSticky(175);
	const { searchCriteria, handleUpdateSearchCriteria, tempDates, setTempDates } = useSearchContext();

	// Ref for dropdowns
	const refs = {
		location: useRef<HTMLDivElement | null>(null),
		date: useRef<HTMLDivElement | null>(null),
		guest: useRef<HTMLDivElement | null>(null),
	};
	// Dropdown states
	const [isDropDownOpen, setDropDownOpen] = useState({ location: false, date: false, guest: false });

	const handleToggleDropdown = useCallback(<K extends keyof typeof isDropDownOpen>(key: K, open: (typeof isDropDownOpen)[K]) => {
		setDropDownOpen((prev) => ({ ...prev, [key]: open }));
	}, []);

	const navigate = useNavigate();

	const handleMainSearch = () => {
		const params = buildSearchParams(searchCriteria);
		navigate(`/search?${params}`);
	};

	const handleDateClose = () => {
		if (tempDates.checkIn && tempDates.checkOut) {
			handleUpdateSearchCriteria("dates", tempDates);
		}
		handleToggleDropdown("date", false);
	};

	return (
		// FIX: The outer Box now holds the searchRef and acts ONLY as the placeholder.
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
				minHeight: sticky ? `${PLACEHOLDER_HEIGHT}px` : "auto",
				transition: "all 0.25s ease",
			}}
		>
			<Paper
				// The Paper is the component that becomes fixed.
				elevation={sticky ? 3 : 1}
				sx={{
					position: sticky ? "fixed" : "relative",
					mt: sticky ? { xs: "56px", md: "64px" } : 0,

					top: sticky ? 8 : "auto",
					// Use left: 50% and transform to center the element reliably
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
						xs: `
        					"destination"
        					"dates"
        					"guests"
        					"search"
    					`,
						sm: `
        					"destination destination"
        					"dates guests"
        					"search search"
    					`,
						md: `
        					"destination dates guests search"
    					`,
					},
					gap: 0,
					borderRadius: 4,
					overflow: "visible",
					minHeight: PAPER_HEIGHT,
				}}
			>
				{/* DESTINATION */}
				<Box
					ref={refs.location}
					sx={{
						gridArea: "destination",
						position: "relative",
						borderRight: { md: "1px solid" },
						borderRightColor: { md: "grey.300" },
					}}
				>
					<SectionBox Icon={SearchIcon} label="Where" onClick={() => handleToggleDropdown("location", true)}>
						<TextField
							placeholder="Search destinations"
							variant="standard"
							value={searchCriteria.keyword}
							onChange={(e) => handleUpdateSearchCriteria("keyword", e.target.value)}
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
							sx={{
								width: "100%",
								"& input": {
									cursor: "text",
									pointerEvents: "auto",
								},
							}}
						/>
					</SectionBox>

					<LocationTypeahead
						open={isDropDownOpen.location}
						onSelect={(loc) => {
							handleUpdateSearchCriteria("keyword", loc.name ?? "");
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
					<SectionBox
						Icon={CalendarIcon}
						label="Check in — Check out"
						onClick={() => {
							setTempDates(searchCriteria.dates);
							handleToggleDropdown("date", true);
						}}
					>
						<Box display="flex" gap={1.5} alignItems="center">
							{/* Check In */}
							<Box>
								{/* Do not use utils.dateFormatter to keep custom date format */}
								<Typography variant="body2" fontWeight={700} lineHeight={1.2}>
									{searchCriteria.dates.checkIn.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
								</Typography>
								<Typography variant="caption" color="text.secondary" fontSize="0.7rem">
									{searchCriteria.dates.checkIn.toLocaleDateString("en-US", { weekday: "short" })}
								</Typography>
							</Box>

							<Typography variant="body2" color="text.secondary">
								—
							</Typography>
							{/* Check Out */}
							<Box>
								<Typography variant="body2" fontWeight={700} lineHeight={1.2}>
									{searchCriteria.dates.checkOut && searchCriteria.dates.checkOut.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
								</Typography>
								<Typography variant="caption" color="text.secondary" fontSize="0.7rem">
									{searchCriteria.dates.checkOut && searchCriteria.dates.checkOut.toLocaleDateString("en-US", { weekday: "short" })}
								</Typography>
							</Box>
						</Box>
					</SectionBox>

					<DatePickerMenu key={`dates-${sticky}`} open={isDropDownOpen.date} anchorEl={refs.date?.current ?? null} onClose={handleDateClose} />
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
							{searchCriteria.guests.adults + searchCriteria.guests.children} guest
							{searchCriteria.guests.adults + searchCriteria.guests.children !== 1 && "s"}
							{searchCriteria.guests.rooms > 1 && ` · ${searchCriteria.guests.rooms} rooms`}
						</Typography>
					</SectionBox>

					<GuestMenu
						key={`guests-${sticky}`}
						open={isDropDownOpen.guest}
						anchorEl={refs.guest?.current ?? null}
						guests={searchCriteria.guests}
						onGuestsChange={(guest: Guests) => handleUpdateSearchCriteria("guests", guest)}
						onClose={() => handleToggleDropdown("guest", false)}
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
