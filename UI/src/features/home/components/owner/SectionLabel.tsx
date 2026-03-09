import { Typography } from "@mui/material";

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<Typography
		sx={{
			color: "primary.main",
			fontFamily: "'Sora', sans-serif",
			fontWeight: 600,
			letterSpacing: "0.1em",
			fontSize: "0.75rem",
			textTransform: "uppercase",
			mb: 2,
		}}
	>
		{children}
	</Typography>
);
export default SectionLabel;
