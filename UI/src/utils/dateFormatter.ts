import type { Dates, StringDates } from "../types/Query";

/**
 * To DD/MM/YYYY
 */
export const formatDate = (d: string): string => {
	return new Date(d).toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
};

/**
 * To YYYY-MM-DD
 */
export const toInputDate = (d: Date): string => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const parseInputDate = (dateString: string): Date => {
	if (!dateString) return new Date();
	const [y, m, d] = dateString.split("-").map(Number);
	return new Date(y, m - 1, d);
};

export const datesToStringDates = (dates: Dates): StringDates => {
	const nextDay = new Date(dates.checkIn);
	nextDay.setDate(dates.checkIn.getDate() + 1);
	return {
		checkIn: toInputDate(dates.checkIn),
		checkOut: toInputDate(dates.checkOut || nextDay),
	};
};

export const stringDatesToDates = (stringDates: StringDates): Dates => {
	return {
		checkIn: parseInputDate(stringDates.checkIn),
		checkOut: parseInputDate(stringDates.checkOut),
	};
};
