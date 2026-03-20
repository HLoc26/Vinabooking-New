import { Box, Typography, LinearProgress } from "@mui/material";
import ConstructionIcon from "@mui/icons-material/Construction";
import EngineeringIcon from "@mui/icons-material/Engineering";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";

const UnderConstruction = () => {
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				minHeight: "60vh",
				textAlign: "center",
				px: 4,
				gap: 0,
			}}
		>
			{/* Icon cluster */}
			<Box sx={{ position: "relative", mb: 4, width: 96, height: 96 }}>
				{/* Background decorative icons */}
				<BuildCircleIcon
					sx={{
						position: "absolute",
						top: 0,
						left: -10,
						fontSize: 28,
						color: "text.disabled",
						opacity: 0.4,
					}}
				/>
				<EngineeringIcon
					sx={{
						position: "absolute",
						bottom: 0,
						right: -10,
						fontSize: 28,
						color: "text.disabled",
						opacity: 0.4,
					}}
				/>
				{/* Main icon */}
				<Box
					sx={{
						position: "absolute",
						inset: 0,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Box
						sx={{
							width: 72,
							height: 72,
							borderRadius: 3,
							bgcolor: "action.selected",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							border: "1px solid",
							borderColor: "divider",
						}}
					>
						<ConstructionIcon sx={{ fontSize: 36, color: "primary.main" }} />
					</Box>
				</Box>
			</Box>

			{/* Heading */}
			<Typography variant="h5" fontWeight={700} gutterBottom color="text.primary">
				Under Construction
			</Typography>

			{/* Subtitle */}
			<Typography variant="body2" color="text.primary" sx={{ maxWidth: 340, lineHeight: 1.7, mb: 3 }}>
				We're working hard to bring this page to life. Check back soon — great things take a little time.
			</Typography>

			{/* Fake progress bar for visual flavour */}
			<Box sx={{ width: 220 }}>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						mb: 0.75,
					}}
				>
					<Typography variant="caption" color="text.secondary">
						Progress
					</Typography>
					<Typography variant="caption" color="text.secondary">
						In progress
					</Typography>
				</Box>
				<LinearProgress
					variant="determinate"
					value={40}
					sx={{
						height: 6,
						borderRadius: 99,
						bgcolor: "action.hover",
						"& .MuiLinearProgress-bar": {
							borderRadius: 99,
						},
					}}
				/>
			</Box>
		</Box>
	);
};

export default UnderConstruction;
