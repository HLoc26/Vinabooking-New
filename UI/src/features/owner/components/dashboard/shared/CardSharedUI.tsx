import { Box, Typography } from "@mui/material";
import React from "react";

// ─── Minimal field-label style ───────────────────────────
export const FieldLabel = ({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) => (
	<Box display="flex" alignItems="center" gap={0.75} mb={1}>
		{icon && <Box sx={{ display: "flex", alignItems: "center", color: "text.disabled", "& svg": { fontSize: "0.85rem" } }}>{icon}</Box>}
		<Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "text.disabled", fontSize: "0.68rem", lineHeight: 1 }}>
			{children}
		</Typography>
	</Box>
);

// ─── Styled read-only value ─────────────────────────────────────────────────
export const FieldValue = ({ children, large }: { children: React.ReactNode; large?: boolean }) => (
	<Typography
		variant={large ? "h6" : "body1"}
		sx={{ fontWeight: large ? 700 : 500, color: "text.primary", lineHeight: 1.4, fontSize: large ? "1.15rem" : "0.95rem", letterSpacing: large ? "-0.01em" : 0 }}
	>
		{children}
	</Typography>
);

// ─── Shared Styles ──────────────────────────────────
export const editFieldSx = {
	"& .MuiOutlinedInput-root": {
		borderRadius: "10px",
		"& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
		"& .Mui-disabled fieldset": { borderColor: "rgba(255,255,255,0.05)" },
		"&:hover fieldset": { borderColor: "rgba(255,255,255,0.25)" },
		"&.Mui-focused fieldset": { borderColor: "primary.main" },
	},
	"& .MuiInputLabel-root": { fontSize: "0.85rem" },
	"& input::-webkit-calendar-picker-indicator": {
		filter: "invert(1)",
		cursor: "pointer",
	},
};

export const getCardSx = (isEditing: boolean) => ({
	borderRadius: "20px",
	border: "1px solid",
	borderColor: isEditing ? "primary.main" : "rgba(255,255,255,0.07)",
	bgcolor: "rgba(255,255,255,0.03)",
	backdropFilter: "blur(12px)",
	overflow: "hidden",
	transition: "border-color 0.25s ease, box-shadow 0.25s ease",
	boxShadow: isEditing ? "0 0 0 3px rgba(var(--mui-palette-primary-mainChannel) / 0.12)" : "0 2px 24px rgba(0,0,0,0.18)",
});

export const getHeaderSx = (isEditing: boolean) => ({
	px: 3.5,
	py: 2.5,
	display: "flex",
	alignItems: "center",
	justifyContent: "space-between",
	borderBottom: "1px solid rgba(255,255,255,0.06)",
	bgcolor: isEditing ? "rgba(var(--mui-palette-primary-mainChannel) / 0.06)" : "transparent",
	transition: "background-color 0.25s ease",
});
