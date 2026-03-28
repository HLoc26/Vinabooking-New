import { useState, useEffect } from "react";
import { Box, Typography, Button, Grid, Skeleton, Card, CardContent, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { ErrorOutlineOutlined, Refresh, GridViewRounded, ViewListRounded } from "@mui/icons-material";
import { useOwnerAccommodations } from "../hooks/useOwnerAccommodations";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { EmptyState } from "../components/dashboard/EmptyState";
import { AccommodationCard } from "../components/dashboard/AccommodationCard";
import { DashboardStatsRow } from "../components/dashboard/DashboardStatsRow";

const DashboardPage = () => {
	const { data: accommodations, isLoading, isError, refetch } = useOwnerAccommodations();

	const [viewMode, setViewMode] = useState<"grid" | "list">(() => (localStorage.getItem("ownerViewMode") as "grid" | "list") || "grid");

	useEffect(() => {
		localStorage.setItem("ownerViewMode", viewMode);
	}, [viewMode]);

	const handleViewChange = (_event: React.MouseEvent<HTMLElement>, newView: "grid" | "list" | null) => {
		if (newView !== null) {
			setViewMode(newView);
		}
	};

	if (isError) {
		return (
			<Box sx={{ pb: 4 }}>
				<DashboardHeader />
				<DashboardStatsRow />
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
					<Grid size={viewMode === "grid" ? { xs: 12, sm: 6, md: 4 } : { xs: 12 }} key={key}>
						<Card sx={{ height: "100%", display: "flex", flexDirection: { xs: "column", sm: viewMode === "list" ? "row" : "column" }, backgroundColor: "background.paper" }}>
							<Skeleton
								variant="rectangular"
								sx={{ width: { xs: "100%", sm: viewMode === "list" ? 280 : "100%" }, height: { xs: 200, sm: viewMode === "list" ? "100%" : 200 }, minHeight: 200 }}
							/>
							<CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 3 }}>
								<Skeleton variant="text" width="30%" sx={{ mb: 1 }} />
								<Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
								<Skeleton variant="text" width="100%" sx={{ mb: 0.5 }} />
								<Skeleton variant="text" width="60%" sx={{ mb: 2 }} />
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
					<Grid size={viewMode === "grid" ? { xs: 12, sm: 6, md: 4 } : { xs: 12 }} key={acc.id}>
						<AccommodationCard data={acc} viewMode={viewMode} />
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
			{(isLoading || (accommodations && accommodations.length > 0)) && <DashboardStatsRow />}

			{accommodations && accommodations.length > 0 && (
				<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
					<Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
						Accommodation Listings
					</Typography>
					<ToggleButtonGroup
						value={viewMode}
						exclusive
						onChange={handleViewChange}
						size="small"
						sx={{
							backgroundColor: "rgba(255,255,255,0.03)",
							borderRadius: 2,
							"& .MuiToggleButton-root": { border: "none", borderRadius: 2, mx: 0.5 },
							"& .Mui-selected": { backgroundColor: "rgba(245,166,35,0.15) !important", color: "primary.main" },
						}}
					>
						<ToggleButton value="grid" aria-label="grid view">
							<GridViewRounded fontSize="small" />
						</ToggleButton>
						<ToggleButton value="list" aria-label="list view">
							<ViewListRounded fontSize="small" />
						</ToggleButton>
					</ToggleButtonGroup>
				</Box>
			)}

			{content}
		</Box>
	);
};

export default DashboardPage;
