import React from "react";
import { Box, Container, Typography, Grid, Stack } from "@mui/material";
import SectionLabel from "../SectionLabel";

const steps = [
	{ num: "01", title: "Sign up for free", desc: "Create an account in minutes. No credit card needed. Fill in your property details and photos." },
	{ num: "02", title: "Set your prices & rules", desc: "Full control over your calendar, nightly rates, and house rules. You're always in charge.", highlighted: true },
	{ num: "03", title: "Welcome your first guest", desc: "Go live instantly to millions of travelers searching for exactly what you offer." },
];

const ProcessSection: React.FC = () => {
	return (
		<Box
			sx={{
				position: "relative",
				overflow: "hidden",
				background: "linear-gradient(180deg, #080d1a 0%, #0d1325 50%, #080d1a 100%)",
				py: { xs: 10, md: 14 },
			}}
		>
			<Box
				sx={{
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%,-50%)",
					width: 1000,
					height: 600,
					borderRadius: "50%",
					pointerEvents: "none",
					background: "radial-gradient(circle, rgba(245,166,35,0.04) 0%, transparent 60%)",
				}}
			/>
			<Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
				<Box textAlign="center" mb={9}>
					<SectionLabel>The process</SectionLabel>
					<Typography variant="h2" sx={{ fontSize: { xs: "2rem", md: "3rem" } }}>
						Up and running in 3 steps
					</Typography>
				</Box>
				<Grid container wrap="nowrap" sx={{ flexDirection: { xs: "column", md: "row" }, position: "relative" }}>
					<Box
						sx={{
							display: { xs: "none", md: "block" },
							position: "absolute",
							top: 36,
							left: "18%",
							right: "18%",
							height: "1px",
							background: "linear-gradient(90deg, transparent, rgba(245,166,35,0.3) 20%, rgba(245,166,35,0.3) 80%, transparent)",
						}}
					/>
					{steps.map((s, i) => (
						<Grid key={i} sx={{ flex: "1 1 0", minWidth: 0 }}>
							<Stack alignItems="center" textAlign="center" px={{ xs: 2, md: 4 }} py={{ xs: 4, md: 0 }}>
								<Box
									sx={{
										width: 72,
										height: 72,
										borderRadius: "50%",
										mb: 4,
										background: s.highlighted ? "linear-gradient(135deg, #f5a623, #e8942a)" : "rgba(245,166,35,0.1)",
										border: s.highlighted ? "none" : "1px solid rgba(245,166,35,0.25)",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										boxShadow: s.highlighted ? "0 0 40px rgba(245,166,35,0.4)" : "none",
										flexShrink: 0,
									}}
								>
									<Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: s.highlighted ? "#080d1a" : "primary.main" }}>{s.num}</Typography>
								</Box>
								<Typography variant="h6" sx={{ color: "text.primary", mb: 1.5 }}>
									{s.title}
								</Typography>
								<Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.8 }}>
									{s.desc}
								</Typography>
							</Stack>
						</Grid>
					))}
				</Grid>
			</Container>
		</Box>
	);
};

export default ProcessSection;
