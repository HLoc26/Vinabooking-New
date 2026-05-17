/**
 * Format a number to Vietnamese Dong (VND)
 * Example: 123000.00 -> 123.000 VND
 */
export const formatVND = (amount: number | string): string => {
	const num = typeof amount === "string" ? parseFloat(amount) : amount;
	if (isNaN(num)) return "0 VND";

	// Use dot as thousand separator and no decimals
	const formatted = Math.round(num)
		.toString()
		.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

	return `${formatted} VND`;
};

/**
 * Standardize remains for general numeric string formatting if needed, 
 * but formatVND is preferred for prices.
 */
export const standardize = (amount: string | number) => {
	const num = typeof amount === "string" ? parseFloat(amount) : amount;
	if (isNaN(num)) return "0";
	return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
