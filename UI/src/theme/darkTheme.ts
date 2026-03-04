// src/theme/darkTheme.ts
import { createTheme } from "@mui/material";

const darkTheme = createTheme({
	palette: {
		mode: "dark",
		primary: { main: "#f5a623" },
		secondary: { main: "#4ecdc4" },
		background: { default: "#080d1a", paper: "#0f1629" },
		text: { primary: "#ffffff", secondary: "rgba(255,255,255,0.55)" },
	},
	typography: {
		fontFamily: "'Sora', 'DM Sans', sans-serif",
		h1: { fontWeight: 800, letterSpacing: "-0.03em" },
		h2: { fontWeight: 800, letterSpacing: "-0.025em" },
		h3: { fontWeight: 700, letterSpacing: "-0.015em" },
		h6: { fontWeight: 600 },
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
					fontSize: "1rem",
				},
			},
		},
		MuiAccordion: {
			styleOverrides: {
				root: {
					background: "rgba(255,255,255,0.03)",
					border: "1px solid rgba(255,255,255,0.08)",
					borderRadius: "16px !important",
					marginBottom: "12px",
					"&:before": { display: "none" },
					"&.Mui-expanded": {
						background: "rgba(255,255,255,0.06)",
						borderColor: "rgba(245,166,35,0.25)",
					},
				},
			},
		},
	},
});

export default darkTheme;
