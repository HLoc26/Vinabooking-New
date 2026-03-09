import React from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import AddHomeWorkRoundedIcon from "@mui/icons-material/AddHomeWorkRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import SectionLabel from "../SectionLabel";

interface BottomCtaSectionProps {
	onGetStarted: () => void;
}

const BottomCtaSection: React.FC<BottomCtaSectionProps> = ({ onGetStarted }) => {
	return (
		<Container maxWidth="lg" sx={{ pb: 12 }}>
			<Box
				sx={{
					position: "relative",
					overflow: "hidden",
					background: "linear-gradient(135deg, #0d1b3e 0%, #162040 100%)",
					border: "1px solid rgba(245,166,35,0.15)",
					borderRadius: 6,
					p: { xs: 6, md: 10 },
					textAlign: "center",
				}}
			>
				<Box
					sx={{
						position: "absolute",
						top: "-60%",
						left: "50%",
						transform: "translateX(-50%)",
						width: 800,
						height: 600,
						borderRadius: "50%",
						pointerEvents: "none",
						background: "radial-gradient(circle, rgba(245,166,35,0.07) 0%, transparent 65%)",
					}}
				/>
				<Box sx={{ position: "relative", zIndex: 1 }}>
					<SectionLabel>Ready to begin?</SectionLabel>
					<Typography variant="h2" sx={{ fontSize: { xs: "2rem", md: "3rem" }, mb: 2.5 }}>
						Your property deserves
						<br />
						to be discovered.
					</Typography>
					<Typography sx={{ color: "text.secondary", fontSize: "1rem", lineHeight: 1.8, mb: 6, maxWidth: 480, mx: "auto", fontFamily: "'DM Sans', sans-serif" }}>
						Join Vinabooking today and turn your extra space into a reliable income stream.
					</Typography>
					<Button
						variant="contained"
						size="large"
						startIcon={<AddHomeWorkRoundedIcon />}
						endIcon={<ArrowForwardRoundedIcon />}
						onClick={onGetStarted}
						sx={{
							background: "linear-gradient(135deg, #f5a623, #e8942a)",
							color: "#080d1a",
							px: 5,
							py: 2,
							fontSize: "1.05rem",
							boxShadow: "0 8px 40px rgba(245,166,35,0.35)",
							"&:hover": { background: "linear-gradient(135deg, #f7b73a, #f5a623)", boxShadow: "0 16px 50px rgba(245,166,35,0.5)", transform: "translateY(-2px)" },
						}}
					>
						List Your Property Now
					</Button>
				</Box>
			</Box>
		</Container>
	);
};

export default BottomCtaSection;
