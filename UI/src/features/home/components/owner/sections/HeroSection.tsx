import React from "react";
import { Box, Container, Typography, Button, Grid, Stack, Chip, CardMedia } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import AddHomeWorkRoundedIcon from "@mui/icons-material/AddHomeWorkRounded";
import AmbientBlobs from "../AmbientBlobs";
import { useCurrency } from "../../../../../hooks/useCurrency";

interface HeroSectionProps {
	scrollY: number;
	onGetStarted: () => void;
	exampleImage: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ scrollY, onGetStarted, exampleImage }) => {
	const { format } = useCurrency();

	return (
		<Box
			sx={{
				position: "relative",
				minHeight: "100vh",
				display: "flex",
				alignItems: "center",
				overflow: "hidden",
				background: "linear-gradient(135deg, #080d1a 0%, #0d1b3e 60%, #080d1a 100%)",
			}}
		>
			<AmbientBlobs />
			<Box
				sx={{
					position: "absolute",
					inset: 0,
					opacity: 0.025,
					pointerEvents: "none",
					backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
					backgroundSize: "60px 60px",
					transform: `translateY(${scrollY * 0.15}px)`,
				}}
			/>

			<Container maxWidth="lg" sx={{ position: "relative", zIndex: 2, py: { xs: 14, md: 0 } }}>
				<Grid container spacing={8} alignItems="center">
					<Grid size={{ xs: 12, md: 6 }} sx={{ animation: "fadeUp 0.9s ease both" }}>
						<Box
							sx={{
								display: "inline-flex",
								alignItems: "center",
								gap: 1,
								bgcolor: "rgba(245,166,35,0.1)",
								border: "1px solid rgba(245,166,35,0.25)",
								borderRadius: 10,
								px: 2,
								py: 0.75,
								mb: 4,
							}}
						>
							<FiberManualRecordIcon sx={{ fontSize: 8, color: "primary.main", filter: "drop-shadow(0 0 4px #f5a623)" }} />
							<Typography sx={{ color: "primary.main", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em" }}>BECOME A HOST</Typography>
						</Box>

						<Typography
							variant="h1"
							sx={{
								fontSize: { xs: "2.6rem", md: "3.8rem" },
								lineHeight: 1.08,
								mb: 3,
								"& span": { background: "linear-gradient(90deg, #f5a623, #f7c56a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
							}}
						>
							List your property.
							<br />
							<span>Start earning today.</span>
						</Typography>

						<Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.8, mb: 5, maxWidth: 460, fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "1.05rem" }}>
							Registration is free and takes under 15 minutes. Join thousands of hosts already earning extra income with Vinabooking.
						</Typography>

						<Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
							<Button
								variant="contained"
								size="large"
								startIcon={<AddHomeWorkRoundedIcon />}
								endIcon={<ArrowForwardRoundedIcon />}
								onClick={onGetStarted}
								sx={{
									background: "linear-gradient(135deg, #f5a623, #e8942a)",
									color: "#080d1a",
									px: 4,
									py: 1.75,
									boxShadow: "0 8px 32px rgba(245,166,35,0.35)",
									"&:hover": { background: "linear-gradient(135deg, #f7b73a, #f5a623)", boxShadow: "0 12px 48px rgba(245,166,35,0.5)", transform: "translateY(-2px)" },
								}}
							>
								Get Started — It's Free
							</Button>
							<Button
								variant="outlined"
								size="large"
								sx={{
									borderColor: "rgba(255,255,255,0.15)",
									color: "rgba(255,255,255,0.7)",
									px: 3.5,
									py: 1.75,
									"&:hover": { borderColor: "rgba(255,255,255,0.4)", color: "#fff", background: "rgba(255,255,255,0.04)" },
								}}
							>
								See how it works
							</Button>
						</Stack>

						<Stack direction="row" alignItems="center" spacing={2} mt={5}>
							<Stack direction="row">
								{["#e63946", "#f4a261", "#2a9d8f", "#457b9d"].map((c, i) => (
									<Box key={i} sx={{ width: 36, height: 36, borderRadius: "50%", bgcolor: c, border: "2px solid #080d1a", ml: i > 0 ? "-10px" : 0 }} />
								))}
							</Stack>
							<Box>
								<Typography sx={{ color: "text.primary", fontWeight: 600, fontFamily: "'Sora', sans-serif", fontSize: "0.875rem" }}>12,000+ active hosts</Typography>
								<Typography sx={{ color: "text.secondary", fontSize: "0.8rem" }}>already earning with us</Typography>
							</Box>
						</Stack>
					</Grid>

					<Grid size={{ xs: 12, md: 6 }} sx={{ display: { xs: "none", md: "flex" }, justifyContent: "center", position: "relative", animation: "fadeUp 0.9s 0.2s ease both" }}>
						<Box
							sx={{
								width: "100%",
								maxWidth: 420,
								background: "linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))",
								border: "1px solid rgba(255,255,255,0.1)",
								borderRadius: 5,
								p: 4,
								backdropFilter: "blur(20px)",
								boxShadow: "0 40px 80px rgba(0,0,0,0.4)",
							}}
						>
							<Box
								sx={{
									height: 200,
									borderRadius: 3,
									mb: 3,
									background: "linear-gradient(135deg, #1a2744, #0d1b3e)",
									border: "1px solid rgba(255,255,255,0.07)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									position: "relative",
									overflow: "hidden",
								}}
							>
								<Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(245,166,35,0.06), rgba(78,205,196,0.06))" }} />
								<Stack alignItems="center" sx={{ zIndex: 1 }}>
									<CardMedia component="img" sx={{ objectFit: "cover" }} image={exampleImage} alt={"Accommodation photo"} />
								</Stack>
							</Box>
							<Stack direction="row" justifyContent="space-between" alignItems="flex-start">
								<Box>
									<Typography sx={{ color: "text.primary", fontWeight: 700, mb: 0.5 }}>My Property - Da Nang</Typography>
									<Typography sx={{ color: "text.secondary", fontSize: "0.8rem" }}>2 bedrooms · 4 guests · beachside</Typography>
								</Box>
								<Chip label="Live ✓" size="small" sx={{ bgcolor: "rgba(245,166,35,0.15)", color: "primary.main", border: "1px solid rgba(245,166,35,0.3)", fontWeight: 700 }} />
							</Stack>
						</Box>

						<Box
							sx={{
								position: "absolute",
								top: -16,
								right: 0,
								background: "linear-gradient(135deg, #f5a623, #e8942a)",
								borderRadius: 4,
								px: 3,
								py: 1,
								boxShadow: "0 16px 40px rgba(245,166,35,0.4)",
								animation: "float 3s ease-in-out infinite",
							}}
						>
							<Typography sx={{ color: "#080d1a", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em" }}>THIS MONTH</Typography>
							<Typography sx={{ color: "#080d1a", fontSize: "1.5rem", fontWeight: 800 }}>{format(28400000)}</Typography>
						</Box>

						<Box
							sx={{
								position: "absolute",
								bottom: -50,
								left: 0,
								bgcolor: "rgba(15,22,42,0.95)",
								border: "1px solid rgba(255,255,255,0.1)",
								borderRadius: 3,
								p: 2,
								px: 3,
								backdropFilter: "blur(20px)",
								boxShadow: "0 16px 40px rgba(0,0,0,0.3)",
								animation: "float 3s 1.5s ease-in-out infinite",
							}}
						>
							<Stack direction="row" spacing={0.25} mb={0.75}>
								{[...Array(5)].map((_, i) => (
									<StarRoundedIcon key={i} sx={{ fontSize: 16, color: "primary.main" }} />
								))}
							</Stack>
							<Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.78rem" }}>"Perfect stay, incredible host!"</Typography>
						</Box>
					</Grid>
				</Grid>
			</Container>
		</Box>
	);
};

export default HeroSection;
