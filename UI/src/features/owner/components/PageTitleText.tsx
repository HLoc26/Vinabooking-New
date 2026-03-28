import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

export const PageTitleText = ({ children }: { children: ReactNode }) => {
	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
			<Box
				sx={{
					width: 4,
					height: 36,
					background: "linear-gradient(180deg, #f7b740, #e8931a)",
					borderRadius: "9999px",
					boxShadow: "0 0 12px rgba(245,166,35,0.4)",
					flexShrink: 0,
				}}
			/>{" "}
			<Typography
				variant="h4"
				component="h1"
				sx={{
					fontWeight: 800,
					letterSpacing: "0.05em",
					lineHeight: 1.5,
					color: "text.primary",
				}}
			>
				{children}
			</Typography>
		</Box>
	);
};
