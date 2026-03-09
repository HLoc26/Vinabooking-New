import { alpha, Box, Typography } from "@mui/material";

interface FeatureCardProps {
	icon: React.ReactNode;
	title: string;
	desc: string;
	accent: string;
}
const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, desc, accent }) => (
	<Box
		sx={{
			position: "relative",
			p: 5,
			height: "100%",
			borderRadius: 4,
			border: "1px solid rgba(255,255,255,0.07)",
			background: "rgba(255,255,255,0.03)",
			overflow: "hidden",
			transition: "all 0.3s ease",
			cursor: "default",
			"&:hover": {
				background: "rgba(255,255,255,0.06)",
				borderColor: alpha(accent, 0.3),
				transform: "translateY(-4px)",
				boxShadow: `0 20px 60px ${alpha(accent, 0.12)}`,
			},
		}}
	>
		<Box
			sx={{
				position: "absolute",
				top: -50,
				right: -50,
				width: 180,
				height: 180,
				borderRadius: "50%",
				background: `radial-gradient(circle, ${alpha(accent, 0.15)} 0%, transparent 70%)`,
				pointerEvents: "none",
			}}
		/>
		<Box
			sx={{
				width: 60,
				height: 60,
				borderRadius: 3,
				background: alpha(accent, 0.12),
				border: `1px solid ${alpha(accent, 0.25)}`,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				color: accent,
				mb: 3,
				fontSize: 28,
			}}
		>
			{icon}
		</Box>
		<Typography variant="h6" sx={{ color: "text.primary", mb: 1.5 }}>
			{title}
		</Typography>
		<Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.8 }}>
			{desc}
		</Typography>
	</Box>
);

export default FeatureCard;
