import { createTheme } from "@mui/material";

const travelerHomeTheme = createTheme({
	palette: {
		primary: { main: "#FB923C" },
		secondary: { main: "#F97316" },
		warning: { main: "#FDE68A" },
		background: { default: "#FFF7ED", paper: "#FFFFFF" },
		text: { primary: "#1E1B4B", secondary: "#6B7280" },
		mode: "light",
	},
	typography: {
		fontFamily: "'Sora', 'DM Sans', sans-serif",
		h1: { fontWeight: 800, letterSpacing: "-0.03em" },
		h2: { fontWeight: 800, letterSpacing: "-0.025em" },
		h3: { fontWeight: 700, letterSpacing: "-0.02em" },
		h4: { fontWeight: 700, letterSpacing: "-0.015em" },
		h5: { fontWeight: 700, letterSpacing: "-0.01em" },
		h6: { fontWeight: 600, letterSpacing: "-0.005em" },
		body1: { fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 },
		body2: { fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 },
		subtitle1: { fontFamily: "'Sora', sans-serif", fontWeight: 600 },
		subtitle2: { fontFamily: "'Sora', sans-serif", fontWeight: 600 },
		caption: { fontFamily: "'DM Sans', sans-serif" },
	},
	shape: { borderRadius: 16 },
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: "none",
					fontWeight: 700,
					fontFamily: "'Sora', sans-serif",
					borderRadius: 14,
					fontSize: "0.95rem",
				},
			},
		},
		MuiCard: {
			styleOverrides: { root: { borderRadius: 20 } },
		},
		MuiAccordion: {
			styleOverrides: {
				root: {
					borderRadius: "16px !important",
					"&:before": { display: "none" },
				},
			},
		},
		MuiChip: {
			styleOverrides: {
				root: {
					fontFamily: "'Sora', sans-serif",
					fontWeight: 600,
					borderRadius: 10,
				},
			},
		},
	},
});

export default travelerHomeTheme;
