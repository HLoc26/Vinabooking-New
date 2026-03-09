import React from "react";
import { Container, Box, Typography, Grid } from "@mui/material";
import SectionLabel from "../SectionLabel";
import FeatureCard from "../FeatureCard";
import MonetizationOnRoundedIcon from "@mui/icons-material/MonetizationOnRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";

const features = [
	{
		icon: <MonetizationOnRoundedIcon fontSize="inherit" />,
		title: "Earn More, Pay Less",
		desc: "Industry-leading low commission rates so the majority of every booking stays with you.",
		accent: "#f5a623",
	},
	{
		icon: <SecurityRoundedIcon fontSize="inherit" />,
		title: "Secure Payments",
		desc: "Bank-grade encryption on every transaction. Earnings hit your account on a fixed schedule.",
		accent: "#4ecdc4",
	},
	{
		icon: <SupportAgentRoundedIcon fontSize="inherit" />,
		title: "24/7 Partner Support",
		desc: "Real people, real solutions — our partner team is on-call around the clock for you.",
		accent: "#a78bfa",
	},
];

const WhyHostSection: React.FC = () => {
	return (
		<Container maxWidth="lg" sx={{ py: { xs: 10, md: 14 } }}>
			<Box textAlign="center" mb={9}>
				<SectionLabel>Why host with us</SectionLabel>
				<Typography variant="h2" sx={{ fontSize: { xs: "2rem", md: "3rem" } }}>
					Everything you need to thrive
				</Typography>
			</Box>
			<Grid container spacing={3} alignItems="stretch" wrap="nowrap" sx={{ flexDirection: { xs: "column", md: "row" } }}>
				{features.map((f, i) => (
					<Grid key={i} sx={{ flex: "1 1 0", minWidth: 0, display: "flex" }}>
						<FeatureCard {...f} />
					</Grid>
				))}
			</Grid>
		</Container>
	);
};

export default WhyHostSection;
