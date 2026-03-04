import { createTheme } from "@mui/material/styles";

const theme = createTheme({
	palette: {
		primary: {
			main: "#FB923C",
		},
		secondary: {
			main: "#F97316",
		},
		warning: {
			main: "#FDE68A", // Accent for highlights/alerts
		},
		background: {
			default: "#FFF7ED",
			paper: "#FFFFFF", // For Card, Modal, Menu
		},
		text: {
			primary: "#1E1B4B",
		},
		mode: "light", // Default light; add dark mode if need later
	},
	typography: {
		fontFamily: "Roboto, Arial, sans-serif",
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					borderRadius: 8,
					textTransform: "none", // Không tự động viết hoa
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: 12, // Bo góc Card
				},
			},
		},
		// Thêm overrides cho các component khác nếu cần
	},
});

export default theme;
