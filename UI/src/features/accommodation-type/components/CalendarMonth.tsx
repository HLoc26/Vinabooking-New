// CalendarMonth.tsx
import React from "react";
import { Box, Button, Typography } from "@mui/material";
import type { DateRange } from "../types/DateRange";

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
}

export const CalendarMonth: React.FC<CalendarMonthProps> = ({ year, month, label, tempDateRange, onDateClick }) => {
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
							"&:hover": { bgcolor: isSelected(d) ? "primary.dark" : "action.hover" },
						}}
					>
						{d}
					</Button>
				))}
			</Box>
		</Box>
	);
};
