import { Box, Typography, Paper, Skeleton, Button, Tabs, Tab } from "@mui/material";
import { useParams, useSearchParams } from "react-router-dom";
import { ErrorOutlineOutlined, Refresh } from "@mui/icons-material";

// Hooks
import { useAccommodationDetailManage } from "../hooks/useAccommodationDetailManage";

// Components
import { ManageBasicInfoCard } from "../components/dashboard/overview/ManageBasicInfoCard";
import { ManageAddressCard } from "../components/dashboard/overview/ManageAddressCard";
import { GlobalHeader } from "../components/dashboard/shared/GlobalHeader";
import { ManageFacilitiesCard } from "../components/dashboard/facilities/ManageFacilitiesCard";
import { ManageRoomsCard } from "../components/dashboard/rooms/ManageRoomsCard";
import { ManageGalleryCard } from "../components/dashboard/gallery/ManageGalleryCard";
import { ManageReviewsCard } from "../components/dashboard/reviews/ManageReviewsCard";
import { ManagePricingRulesCard } from "../components/dashboard/pricing/ManagePricingRulesCard";
import { ManageHolidayPricingCard } from "../components/dashboard/pricing/ManageHolidayPricingCard";
import { MassUpdateFloorPriceCard } from "../components/dashboard/pricing/MassUpdateFloorPriceCard";

export default function ManageAccommodationPage() {
	const { accommodationId } = useParams<{ accommodationId: string }>();
	const [searchParams, setSearchParams] = useSearchParams();

	const currentTab = searchParams.get("tab") || "overview";

	const { data: accommodation, isLoading, isError, refetch } = useAccommodationDetailManage(accommodationId);

	const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
		const newParams = new URLSearchParams(searchParams);
		newParams.set("tab", newValue);
		newParams.delete("roomId");
		setSearchParams(newParams, { replace: true });
	};

	if (isError) {
		return (
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					py: 8,
					bgcolor: "background.paper",
					borderRadius: 4,
					border: "1px solid rgba(244, 67, 54, 0.2)",
				}}
			>
				<ErrorOutlineOutlined sx={{ fontSize: 64, color: "error.main", mb: 2, opacity: 0.8 }} />
				<Typography variant="h6" color="text.primary" gutterBottom>
					Failed to load details
				</Typography>
				<Button variant="outlined" color="error" startIcon={<Refresh />} onClick={() => refetch()}>
					Try Again
				</Button>
			</Box>
		);
	}

	if (isLoading || !accommodation) {
		return (
			<Box sx={{ pb: 4, width: "100%" }}>
				<Skeleton variant="rounded" width="100%" height={140} sx={{ borderRadius: 3, mb: 2 }} />
				<Skeleton variant="text" width="60%" height={60} sx={{ mb: 4 }} />
				<Paper sx={{ p: 4, borderRadius: 3, minHeight: 600 }}>
					<Skeleton variant="rounded" width="100%" height={300} sx={{ borderRadius: 2 }} />
				</Paper>
			</Box>
		);
	}

	return (
		<Box sx={{ pb: 4, width: "100%" }}>
			{/* 1. Global Header */}
			<GlobalHeader accommodation={accommodation} />

			{/* 2. Tab Navigation */}
			<Box
				sx={{
					position: "sticky",
					top: 0,
					zIndex: 1100,
					bgcolor: "background.default",
					pt: 2,
					mb: 4,
					mx: -4,
					px: 4,

					borderBottom: "1px solid",
					borderColor: "divider",
				}}
			>
				<Tabs
					value={currentTab === "roomDetail" ? "rooms" : currentTab}
					onChange={handleTabChange}
					textColor="primary"
					indicatorColor="primary"
					sx={{
						"& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: 15, minWidth: 100 },
					}}
				>
					<Tab label="Overview" value="overview" />
					<Tab label="Facilities" value="facilities" />
					<Tab label="Rooms" value="rooms" />
					<Tab label="Pricing" value="pricing" />
					<Tab label="Photo Gallery" value="gallery" />
					<Tab label="Guest Reviews" value="reviews" />
				</Tabs>
			</Box>

			{/* 3. Content Area */}
			<Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 3 }}>
				{currentTab === "overview" && (
					<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
						<ManageBasicInfoCard
							accommodationId={accommodationId!}
							initialData={{
								name: accommodation.name,
								description: accommodation.description ?? "",
								type: accommodation.type,
								rentalType: accommodation.rentalType,
							}}
						/>
						<ManageAddressCard accommodationId={accommodationId!} initialAddress={accommodation.address} />
					</Box>
				)}

				{currentTab === "facilities" && (
					<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
						<ManageFacilitiesCard accommodationId={accommodationId!} initialFacilities={accommodation.facilities} />
					</Box>
				)}

				{(currentTab === "rooms" || currentTab === "roomDetail") && (
					<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
						<ManageRoomsCard accommodationId={accommodationId!} accommodationData={accommodation} />
					</Box>
				)}

				{currentTab === "pricing" && (
					<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
						<ManagePricingRulesCard accommodationId={accommodationId!} initialSettings={accommodation.dynamicPricingSettings ?? null} />
						<ManageHolidayPricingCard accommodationId={accommodationId!} initialOptIns={accommodation.holidayOptIns ?? []} />
						<MassUpdateFloorPriceCard accommodationId={accommodationId!} rooms={accommodation.rooms as any} />
					</Box>
				)}

				{currentTab === "gallery" && (
					<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
						<ManageGalleryCard accommodationId={accommodationId!} accommodationData={accommodation} />
					</Box>
				)}

				{currentTab === "reviews" && (
					<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
						<ManageReviewsCard accommodationId={accommodationId!} />
					</Box>
				)}
			</Box>
		</Box>
	);
}
