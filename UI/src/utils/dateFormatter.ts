/**
 * To DD/MM/YYYY
 */
export const formatDate = (d: string) =>
	new Date(d).toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});

/**
 * To YYYY-MM-DD
 */
export const toInputDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
