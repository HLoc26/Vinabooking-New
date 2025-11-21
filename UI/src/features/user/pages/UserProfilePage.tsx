import { Container, Grid, Paper } from "@mui/material";
import SideBar from "../components/SideBar";
import ProfileTab from "../components/tabs/ProfileTab";
import { useState } from "react";
import type { TabLabel } from "../types/tabs";
import BookingTab from "../components/tabs/BookingsTab";

const UserProfilePage: React.FC = () => {
	const [selectedTab, setSelectedTab] = useState<TabLabel>("Profile");

	const handleSelectTab = (label: TabLabel) => {
		setSelectedTab(label);
	};

	const tab = (function () {
		switch (selectedTab) {
			case "Profile":
				return <ProfileTab />;
			case "Bookings":
				return <BookingTab />;
			default:
				return <ProfileTab />;
		}
	})();

	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Grid container spacing={3} sx={{ mt: 5 }}>
				<Grid size={{ md: 3 }}>
					<SideBar selected={selectedTab} handleSelected={handleSelectTab} />
				</Grid>
				<Grid size={{ md: 9 }}>
					<Paper elevation={1} sx={{ p: 3, borderRadius: 3 }}>
						{tab}
					</Paper>
				</Grid>
			</Grid>
		</Container>
	);
};

export default UserProfilePage;
