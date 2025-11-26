import { Tabs, Tab, Paper } from "@mui/material";
import { OverviewTab } from "./tabs/OverviewTab";
import { RoomsTab } from "./tabs/RoomsTab";
import { ReviewsTab } from "./tabs/ReviewsTab";
import type { AccommodationDetail } from "../../types/accommodation.types";

interface Props {
	tabValue: number;
	onChange: (value: number) => void;
	accommodation: AccommodationDetail;
}

export const DetailTabs = ({ tabValue, onChange, accommodation }: Props) => {
	return (
		<>
			<Paper sx={{ mb: 3 }}>
				<Tabs value={tabValue} onChange={(_, v) => onChange(v)} variant="fullWidth">
					<Tab label="Overview" />
					<Tab label="Rooms" />
					<Tab label="Reviews" />
				</Tabs>
			</Paper>

			{tabValue === 0 && <OverviewTab accommodation={accommodation} />}
			{tabValue === 1 && <RoomsTab accommodation={accommodation} />}
			{tabValue === 2 && <ReviewsTab accommodation={accommodation} />}
		</>
	);
};
