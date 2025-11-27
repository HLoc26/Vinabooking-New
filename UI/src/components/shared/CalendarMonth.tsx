import React from "react";
import { Box, Button, Typography } from "@mui/material";
import type { DateRange } from "../../types/DateRange";

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => {
	const day = new Date(year, month, 1).getDay();
	return day === 0 ? 6 : day - 1;
};

interface CalendarMonthProps {
	year: number;
	month: number;
	label: string;
	tempDateRange: DateRange;
	onDateClick: (date: Date) => void;
	minDate?: Date; // Add this prop
}

export const CalendarMonth: React.FC<CalendarMonthProps> = ({
	year,
	month,
	label,
	tempDateRange,
	onDateClick,
	minDate, // Add this
}) => {
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

	// Add this function to check if date is disabled
	const isDisabled = (day: number) => {
		if (!minDate) return false;
		const date = new Date(year, month, day);
		date.setHours(0, 0, 0, 0);
		const min = new Date(minDate);
		min.setHours(0, 0, 0, 0);
		return date < min;
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
				{blanks.map((_, i) => (
					<Box key={`blank-${i}`} />
				))}
				{days.map((d) => {
					const disabled = isDisabled(d);
					const selected = isSelected(d);
					const inRange = isInRange(d);

					return (
						<Button
							key={d}
							variant="text"
							disabled={disabled}
							onClick={(e) => {
								e.stopPropagation();
								if (!disabled) {
									onDateClick(new Date(year, month, d));
								}
							}}
							sx={{
								borderRadius: "50%",
								minWidth: 32,
								height: 32,
								p: 0,
								fontSize: "0.85rem",
								bgcolor: selected ? "primary.main" : inRange ? "primary.light" : "transparent",
								color: selected ? "white" : inRange ? "primary.contrastText" : disabled ? "text.disabled" : "inherit",
								opacity: disabled ? 0.3 : 1,
								cursor: disabled ? "not-allowed" : "pointer",
								"&:hover": {
									bgcolor: disabled ? "transparent" : selected ? "primary.dark" : "action.hover",
								},
								"&.Mui-disabled": {
									color: "text.disabled",
									opacity: 0.3,
								},
							}}
						>
							{d}
						</Button>
					);
				})}
			</Box>
		</Box>
	);
};

