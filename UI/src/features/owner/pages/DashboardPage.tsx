import { Box, Typography, Button, Grid, Skeleton, Card, CardContent } from "@mui/material";
import { ErrorOutlineOutlined, Refresh } from "@mui/icons-material";
import { useOwnerAccommodations } from "../hooks/useOwnerAccommodations";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { EmptyState } from "../components/dashboard/EmptyState";
import { AccommodationCard } from "../components/dashboard/AccommodationCard";
import { DashboardStatsRow } from "../components/dashboard/DashboardStatsRow";

const DashboardPage = () => {
	const { data: accommodations, isLoading, isError, refetch } = useOwnerAccommodations();

	if (isError) {
		return (
			<Box sx={{ pb: 4 }}>
				<DashboardHeader />
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						py: 8,
						textAlign: "center",
						backgroundColor: "background.paper",
						borderRadius: 4,
						border: "1px solid rgba(244, 67, 54, 0.2)",
					}}
				>
					<ErrorOutlineOutlined sx={{ fontSize: 64, color: "error.main", mb: 2, opacity: 0.8 }} />
					<Typography variant="h6" color="text.primary" gutterBottom>
						Failed to load accommodations
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
						Please check your internet connection and try again.
					</Typography>
					<Button variant="outlined" color="error" startIcon={<Refresh />} onClick={() => refetch()}>
						Try Again
					</Button>
				</Box>
			</Box>
		);
	}

	let content;
	if (isLoading) {
		const skeletonKeys = [1, 2, 3, 4, 5, 6];
		content = (
			<Grid container spacing={3}>
				{skeletonKeys.map((key) => (
					<Grid size={{ xs: 12, sm: 6, md: 4 }} key={key}>
						<Card sx={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: "background.paper" }}>
							<Skeleton variant="rectangular" height={200} />
							<CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 3 }}>
								<Skeleton variant="text" width="30%" sx={{ mb: 1 }} />
								<Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
								<Skeleton variant="text" width="100%" sx={{ mb: 0.5 }} />
								<Skeleton variant="text" width="60%" sx={{ mb: 2 }} />

								<Box sx={{ mt: "auto", pt: 2, display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
									<Skeleton variant="text" width="30%" />
									<Skeleton variant="text" width="30%" />
								</Box>
							</CardContent>
						</Card>
					</Grid>
				))}
			</Grid>
		);
	} else if (accommodations && accommodations.length > 0) {
		content = (
			<Grid container spacing={3}>
				{accommodations.map((acc) => (
					<Grid size={{ xs: 12, sm: 6, md: 4 }} key={acc.id}>
						<AccommodationCard data={acc} />
					</Grid>
				))}
			</Grid>
		);
	} else {
		content = <EmptyState />;
	}

	return (
		<Box sx={{ pb: 4 }}>
			<DashboardHeader />
			<DashboardStatsRow />
			{content}
		</Box>
	);
};

export default DashboardPage;
