import { Grid, Card, CardContent, Typography, Box, Skeleton, LinearProgress, Tooltip, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { AccountBalanceWalletRounded, BedRounded, EventNoteRounded, ArrowForwardIosRounded } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useDashboardStats } from "../../hooks/useDashboardStats";
import { formatVND } from "../../../../utils/moneyConverter";

export const DashboardStatsRow = () => {
	const { data: stats, isLoading, isError } = useDashboardStats();
	const navigate = useNavigate();
	const theme = useTheme();

	if (isError) {
		return (
			<Typography color="error" variant="body2" sx={{ mb: 3, fontStyle: "italic", opacity: 0.8 }}>
				* Unable to load dashboard statistics at this time.
			</Typography>
		);
	}

	if (isLoading) {
		return (
			<Grid container spacing={3} sx={{ mb: 4 }}>
				{[1, 2, 3].map((key) => (
					<Grid size={{ xs: 12, md: 4 }} key={key}>
						<Skeleton variant="rectangular" height={140} sx={{ borderRadius: "16px" }} />
					</Grid>
				))}
			</Grid>
		);
	}

	return (
		<Grid container spacing={3} sx={{ mb: 4 }}>
			{/* CARD 1: REVENUE */}
			<Grid size={{ xs: 12, md: 4 }}>
				<Card
					sx={{
						height: "100%",
						borderRadius: "16px",
						backgroundColor: "background.paper",
						backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)",
						border: "1px solid rgba(255,255,255,0.06)",
						boxShadow: "0 8px 32px -8px rgba(0,0,0,0.3)",
						transition: "transform 0.2s ease",
						"&:hover": { transform: "translateY(-2px)" },
					}}
				>
					<CardContent sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
						<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
							<Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 1.2, lineHeight: 1 }}>
								MTD Revenue
							</Typography>
							<Box
								sx={{
									width: 42,
									height: 42,
									borderRadius: "12px",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									backgroundColor: alpha(theme.palette.secondary.main, 0.15),
									color: "secondary.main",
									boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.2)}`,
								}}
							>
								<AccountBalanceWalletRounded />
							</Box>
						</Box>

						<Typography variant="h3" color="text.primary" sx={{ fontWeight: 700, fontSize: "2rem", mb: 0.5, display: "flex", alignItems: "baseline" }}>
							{formatVND(stats?.revenue || 0)}
						</Typography>

						<Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7, mt: "auto" }}>
							Confirmed bookings this month
						</Typography>
					</CardContent>
				</Card>
			</Grid>

			{/* CARD 2: OCCUPANCY RATE */}
			<Grid size={{ xs: 12, md: 4 }}>
				<Card
					sx={{
						height: "100%",
						borderRadius: "16px",
						backgroundColor: "background.paper",
						backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)",
						border: "1px solid rgba(255,255,255,0.06)",
						boxShadow: "0 8px 32px -8px rgba(0,0,0,0.3)",
						transition: "transform 0.2s ease",
						"&:hover": { transform: "translateY(-2px)" },
					}}
				>
					<CardContent sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
						<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
							<Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 1.2, lineHeight: 1 }}>
								Occupancy Rate
							</Typography>
							<Box
								sx={{
									width: 42,
									height: 42,
									borderRadius: "12px",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									backgroundColor: alpha(theme.palette.primary.main, 0.15),
									color: "primary.main",
									boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
								}}
							>
								<BedRounded />
							</Box>
						</Box>
						<Typography variant="h3" color="text.primary" sx={{ fontWeight: 700, fontSize: "2rem", mb: 1.5 }}>
							{stats?.occupancyRate || 0}%
						</Typography>
						<Box sx={{ mt: "auto" }}>
							<LinearProgress
								variant="determinate"
								value={stats?.occupancyRate || 0}
								sx={{
									height: 6,
									borderRadius: 3,
									backgroundColor: alpha(theme.palette.common.white, 0.05),
									"& .MuiLinearProgress-bar": { backgroundColor: "primary.main", borderRadius: 3 },
								}}
							/>
						</Box>
					</CardContent>
				</Card>
			</Grid>

			{/* CARD 3: PENDING BOOKINGS */}
			<Grid size={{ xs: 12, md: 4 }}>
				<Tooltip title="Click to review pending bookings" placement="top" arrow>
					<Card
						onClick={() => navigate("/owner/manage-booking?tab=pending")}
						sx={{
							height: "100%",
							borderRadius: "16px",
							backgroundColor: "background.paper",
							backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)",
							border: "1px solid rgba(255,255,255,0.06)",
							boxShadow: "0 8px 32px -8px rgba(0,0,0,0.3)",
							cursor: "pointer",
							position: "relative",
							overflow: "hidden",
							transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
							"&:hover": {
								transform: "translateY(-4px)",
								borderColor: "error.main",
								boxShadow: `0 12px 24px -8px ${alpha(theme.palette.error.main, 0.4)}`,
								"& .arrow-icon": { transform: "translateX(4px)", color: "error.main" },
							},
						}}
					>
						{(stats?.pendingBookings || 0) > 0 && <Box sx={{ position: "absolute", top: 0, left: 0, width: "4px", height: "100%", backgroundColor: "error.main" }} />}
						<CardContent sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
							<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
								<Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 1.2, lineHeight: 1 }}>
									Pending Bookings
								</Typography>
								<Box
									sx={{
										width: 42,
										height: 42,
										borderRadius: "12px",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										backgroundColor: alpha(theme.palette.common.white, 0.05),
										color: "text.secondary",
									}}
								>
									<EventNoteRounded />
								</Box>
							</Box>
							<Typography variant="h3" color={(stats?.pendingBookings || 0) > 0 ? "error.main" : "text.primary"} sx={{ fontWeight: 700, fontSize: "2rem", mb: 0.5 }}>
								{stats?.pendingBookings || 0}
							</Typography>
							<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mt: "auto" }}>
								<Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7 }}>
									Requires your attention
								</Typography>
								<ArrowForwardIosRounded className="arrow-icon" sx={{ fontSize: 14, color: "text.disabled", transition: "all 0.2s" }} />
							</Box>
						</CardContent>
					</Card>
				</Tooltip>
			</Grid>
		</Grid>
	);
};
