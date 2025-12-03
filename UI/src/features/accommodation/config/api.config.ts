export const API_CONFIG = {
	BASE_URL: (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/+$/, ""),
	TIMEOUT: 30000,

	ENDPOINTS: {
		ACCOMMODATIONS: {
			SEARCH: "/accommodations/search",
			GET_BY_ID: "/accommodations",
		},
	},
};
