// DatePickerMenu.tsx
import React from "react";
import { Box, IconButton, Typography, Menu } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { CalendarMonth } from "../components/CalendarMonth";
import type { DateRange } from "../types/DateRange";

interface DatePickerMenuProps {
	open: boolean;
	anchorEl: HTMLElement | null;
	tempDateRange: DateRange;
	monthOffset: number;
	onMonthPrev: () => void;
	onMonthNext: () => void;
	onDateClick: (date: Date) => void;
	onClose: () => void;
}

// Set minimum date to tomorrow
const getMinDate = () => {
	const today = new Date();
	return today;
};

export const DatePickerMenu: React.FC<DatePickerMenuProps> = ({ open, anchorEl, tempDateRange, monthOffset, onMonthPrev, onMonthNext, onDateClick, onClose }) => {
	const today = new Date();
	const minDate = getMinDate();

	// Calculate the current viewing month/year based on offset
	const currentViewDate = new Date(today.getFullYear(), today.getMonth() + monthOffset);
	const nextViewDate = new Date(today.getFullYear(), today.getMonth() + monthOffset + 1);

	const visibleMonths = [currentViewDate, nextViewDate];

	return (
		<Menu open={open} onClose={onClose} anchorEl={anchorEl} anchorOrigin={{ vertical: "bottom", horizontal: "left" }} disableAutoFocusItem MenuListProps={{ onClick: (e) => e.stopPropagation() }}>
			<Box display="flex" justifyContent="space-between" alignItems="center" px={2} py={1}>
				<IconButton onClick={onMonthPrev} disabled={monthOffset === 0}>
					<ChevronLeftIcon />
				</IconButton>

				<Typography fontWeight={700}>
					{currentViewDate.toLocaleString("default", { month: "long", year: "numeric" })}
					{" - "}
					{nextViewDate.toLocaleString("default", { month: "long", year: "numeric" })}
				</Typography>

				<IconButton onClick={onMonthNext}>
					<ChevronRightIcon />
				</IconButton>
			</Box>

			<Box display="flex" p={2} gap={2} onClick={(e) => e.stopPropagation()}>
				{visibleMonths.map((date) => (
					<CalendarMonth
						key={`${date.getFullYear()}-${date.getMonth()}`}
						year={date.getFullYear()}
						month={date.getMonth()}
						label={date.toLocaleString("default", { month: "long", year: "numeric" })}
						tempDateRange={tempDateRange}
						onDateClick={onDateClick}
						minDate={minDate}
					/>
				))}
			</Box>
		</Menu>
	);
};
