export const formatDate = (d: string) =>
	new Date(d).toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
