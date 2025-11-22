// DatePickerMenu.tsx
import React from "react";
import { Box, IconButton, Typography, Menu } from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

const today = new Date();

export const DatePickerMenu: React.FC<DatePickerMenuProps> = ({ open, anchorEl, tempDateRange, monthOffset, onMonthPrev, onMonthNext, onDateClick, onClose }) => {
	const visibleMonths = [new Date(today.getFullYear(), today.getMonth() + monthOffset), new Date(today.getFullYear(), today.getMonth() + monthOffset + 1)];

	return (
		<Menu open={open} onClose={onClose} anchorEl={anchorEl} anchorOrigin={{ vertical: "bottom", horizontal: "left" }} disableAutoFocusItem MenuListProps={{ onClick: (e) => e.stopPropagation() }}>
			<Box display="flex" justifyContent="space-between" alignItems="center" px={2} py={1}>
				<IconButton onClick={onMonthPrev} disabled={monthOffset === 0}>
					<ChevronLeft />
				</IconButton>
				<Typography fontWeight={700}>Select Dates</Typography>
				<IconButton onClick={onMonthNext}>
					<ChevronRight />
				</IconButton>
			</Box>

			<Box display="flex" p={2} gap={2} onClick={(e) => e.stopPropagation()}>
				{visibleMonths.map((date, i) => (
					<CalendarMonth
						key={i}
						year={date.getFullYear()}
						month={date.getMonth()}
						label={date.toLocaleString("default", { month: "long", year: "numeric" })}
						tempDateRange={tempDateRange}
						onDateClick={onDateClick}
					/>
				))}
			</Box>
		</Menu>
	);
};
