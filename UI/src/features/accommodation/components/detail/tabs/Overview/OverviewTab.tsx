import { Box, Paper, Typography } from "@mui/material";
import { FacilitiesSection } from "./components/FacilitiesSection";
import { LocationSection } from "./components/LocationSection";
import type { AccommodationDetail } from "../../../../types/accommodation.types";

interface OverviewTabProps {
	accommodation: AccommodationDetail;
}

export const OverviewTab = ({ accommodation }: OverviewTabProps) => (
	<Box>
		<Paper sx={{ p: 3, mb: 3 }}>
			<Typography variant="h6" fontWeight="bold" gutterBottom>
				About this property
			</Typography>
			<Typography variant="body1" color="text.secondary" paragraph>
				{accommodation.description}
			</Typography>
		</Paper>

		<FacilitiesSection accommodation={accommodation} />
		<LocationSection accommodation={accommodation} />
	</Box>
);
