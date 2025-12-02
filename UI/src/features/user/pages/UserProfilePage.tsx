import { Container, Grid, Paper } from "@mui/material";
import SideBar from "../components/SideBar";
import ProfileTab from "../components/tabs/ProfileTab/ProfileTab";
import { useEffect, useState } from "react";
import type { TabLabel } from "../types/tabs";
import BookingTab from "../components/tabs/BookingsTab/BookingsTab";
import FavouritesTab from "../components/tabs/FavouritesTab/FavouritesTab";
import { useLocation, useNavigate } from "react-router-dom";

const UserProfilePage: React.FC = () => {
	const [selectedTab, setSelectedTab] = useState<TabLabel>("Profile");
	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		const path = location.pathname;
		if (path.includes("/user/me/profile")) {
			setSelectedTab("Profile");
		} else if (path.includes("/user/me/my-bookings")) {
			setSelectedTab("Bookings");
		} else if (path.includes("/user/me/favorites")) {
			setSelectedTab("Favourite List");
		}
	}, [location.pathname]);

	const handleSelectTab = (label: TabLabel) => {
		setSelectedTab(label);
		switch (label) {
			case "Profile":
				navigate("/user/me/profile");
				break;
			case "Bookings":
				navigate("/user/me/my-bookings");
				break;
			case "Favourite List":
				navigate("/user/me/favorites");
				break;
		}
	};

	const tab = (function () {
		switch (selectedTab) {
			case "Profile":
				return <ProfileTab />;
			case "Bookings":
				return <BookingTab />;
			case "Favourite List":
				return <FavouritesTab />;
			default:
				return <ProfileTab />;
		}
	})();

	return (
		<Container maxWidth="lg" sx={{ py: 1 }}>
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
