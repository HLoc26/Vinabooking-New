import { Paper, Stack, Typography, Box } from "@mui/material";
import type { Booking } from "../../../../booking/types/Booking";
import { WalletOutlined, LuggageOutlined, NightsStayOutlined, StarRateRounded } from "@mui/icons-material";
import { useCurrency } from "../../../../../hooks/useCurrency";

type BookingStatsOverviewProps = {
	bookings: Booking[];
};

const BookingStatsOverview: React.FC<BookingStatsOverviewProps> = ({ bookings }) => {
	const { format } = useCurrency();
	const totalSpent = bookings.reduce((sum, b) => sum + Number(b.totalPrice), 0);
	const upcomingBookings = bookings.filter((b) => b.status === "BOOKED" && new Date(b.startDate) > new Date());

	const completedBookings = bookings.filter((b) => b.status === "COMPLETED");
	const totalNights = completedBookings.reduce((sum, b) => {
		const start = new Date(b.startDate).getTime();
		const end = new Date(b.endDate).getTime();
		const nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24))); // Tính số ngày, ít nhất là 1
		return sum + nights;
	}, 0);

	// Tạm thời để Rating là N/A vì object Booking không chứa dữ liệu review
	const avgRating = "N/A";

	const stats = [
		{
			label: "Total Spent",
			icon: <WalletOutlined fontSize="large" />,
			value: format(totalSpent),
			bgColor: "#d1f3d1", // xanh USD
		},
		{
			label: "Upcoming Trip",
			icon: <LuggageOutlined fontSize="large" />,
			value: upcomingBookings.length || 0,
			bgColor: "#d4eaff", // xanh biển nhạt
		},
		{
			label: "Total Nights",
			icon: <NightsStayOutlined fontSize="large" />,
			value: totalNights || 0,
			bgColor: "#ead8ff", // tím nhạt
		},
		{
			label: "Avg Rating Given",
			icon: <StarRateRounded fontSize="large" />,
			value: avgRating,
			bgColor: "#fff2b3", // vàng nhạt
		},
	];

	return (
		<Stack direction="row" spacing={3}>
			{stats.map((stat) => (
				<Paper
					key={stat.label}
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
						{stat.value}
					</Typography>
				</Paper>
			))}
		</Stack>
	);
};

export default BookingStatsOverview;
