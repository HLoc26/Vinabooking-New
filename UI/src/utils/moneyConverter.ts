export const standardize = (amount: string | number) => {
	return amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
