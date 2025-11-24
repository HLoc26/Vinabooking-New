import { Paper, Stack, Typography, Box, Skeleton } from "@mui/material";
import type { Booking } from "../../../types/Booking";
import { WalletOutlined, LuggageOutlined, NightsStayOutlined, StarRateRounded } from "@mui/icons-material";
import { standardize } from "../../../../../utils/moneyConverter";

type BookingStatsOverviewProps = {
	bookings: Booking[];
};

const BookingStatsOverview: React.FC<BookingStatsOverviewProps> = ({ bookings }) => {
	const totalSpent = bookings.reduce((sum, b) => sum + Number(b.totalPrice), 0);
	const upcomingBookings = bookings.filter((b) => b.status === "BOOKED" && b.startDate > new Date());
	const completedBookings = bookings.filter((b) => b.status === "COMPLETED");

	const stats = [
		{
			label: "Total Spent",
			icon: <WalletOutlined fontSize="large" />,
			value: `$${standardize(totalSpent)}`,
			bgColor: "#d1f3d1", // xanh USD
		},
		{
			label: "Upcoming Trip",
			icon: <LuggageOutlined fontSize="large" />,
			value: upcomingBookings.length,
			bgColor: "#d4eaff", // xanh biển nhạt
		},
		{
			label: "Total Nights",
			icon: <NightsStayOutlined fontSize="large" />,
			value: completedBookings.length,
			bgColor: "#ead8ff", // tím nhạt
		},
		{
			label: "Avg Rating Given",
			icon: <StarRateRounded fontSize="large" />,
			value: 5,
			bgColor: "#fff2b3", // vàng nhạt
		},
	];

	return (
		<Stack direction="row" spacing={3}>
			{stats.map((stat, idx) => (
				<Paper
					key={idx}
					elevation={1}
					sx={{
						p: 2.5,
						borderRadius: 3,
						width: 180,
						display: "flex",
						flexDirection: "column",
						gap: 1,
						alignItems: "flex-start",
						border: "1px solid #eee",
						transition: "all 0.2s ease",
						":hover": {
							boxShadow: 3,
							borderColor: "primary.main",
						},
					}}
				>
					<Box
						sx={{
							p: 1,
							borderRadius: "12px",
							bgcolor: stat.bgColor,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						{stat.icon}
					</Box>

					<Typography variant="subtitle2" color="text.secondary">
						{stat.label}
					</Typography>

					<Typography variant="h6" fontWeight={700}>
						{stat.value ? stat.value : <Skeleton variant="text" />}
					</Typography>
				</Paper>
			))}
		</Stack>
	);
};

export default BookingStatsOverview;
