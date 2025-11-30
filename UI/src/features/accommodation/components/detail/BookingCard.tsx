import { Paper, Typography, Button, Box, Divider, Stack } from "@mui/material";
import { ProtectedLink } from "../../../../components/shared/ProtectedLink";
import { usePushNotificationContext } from "../../../../context/PushNotification/hook";
import type { ItemInfo } from "../../../../types/BookingContextInfo";
import { DatePickerMenu } from "../../../../components/shared/DatePickerMenu";
import { useState } from "react";
import { type Dates } from "../../../../types/Query";

interface Props {
	rooms: ItemInfo[];
	nights: number;
	totalPrice: number;
	startDate: Date;
	endDate: Date;
	onStartDateChange: (date: Date) => void;
	onEndDateChange: (date: Date) => void;
}

export const BookingCard = ({ rooms, nights, totalPrice, startDate, endDate, onStartDateChange, onEndDateChange }: Props) => {
	const { pushNotification } = usePushNotificationContext();
	const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
	const [dates, setDates] = useState<Dates>({
		checkIn: startDate,
		checkOut: endDate,
	});

	const handleOpenMenu = (e: React.MouseEvent<HTMLElement>) => {
		setDates({
			checkIn: startDate,
			checkOut: endDate,
		});
		setMenuAnchor(e.currentTarget);
	};

	return (
		<Paper sx={{ p: 3, position: "sticky", top: 16, boxShadow: 3 }}>
			<Typography variant="h6" fontWeight="bold" gutterBottom>
				Book Your Stay
			</Typography>
			<Box sx={{ mb: 2 }}>
				<Typography variant="caption" color="text.secondary">
					Total for {nights} {nights === 1 ? "night" : "nights"}
				</Typography>
				<Typography variant="h4" fontWeight="bold" color="primary">
					${totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
				</Typography>
			</Box>
			<Divider sx={{ my: 2 }} />
			<Stack spacing={2}>
				<Box
					sx={{
						border: "1px solid rgba(0,0,0,0.23)",
						borderRadius: 1,
						p: 1.5,
						cursor: "pointer",
					}}
					onClick={handleOpenMenu}
				>
					<Typography variant="caption" color="text.secondary">
						Dates
					</Typography>
					<Typography fontWeight={600}>
						{startDate.toLocaleDateString()} — {endDate?.toLocaleDateString()}
					</Typography>
				</Box>
				<ProtectedLink //
					to="/booking"
					canNavigate={() => rooms.length > 0}
					onFail={() => pushNotification("Please choose at least one room", "error")}
				>
					<Button variant="contained" size="large" fullWidth>
						Reserve Now
					</Button>
				</ProtectedLink>
			</Stack>
			<Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2, textAlign: "center" }}>
				✓ Free cancellation available
			</Typography>
			<Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center" }}>
				✓ No payment needed today
			</Typography>
			<DatePickerMenu
				open={Boolean(menuAnchor)}
				anchorEl={menuAnchor}
				selectedDates={dates}
				setSelectedDates={(dates) => setDates(dates)}
				onClose={() => {
					// commit
					onStartDateChange(dates.checkIn);

					const fallback = new Date();
					fallback.setDate(fallback.getDate() + 2);
					fallback.setHours(0, 0, 0, 0);

					onEndDateChange(dates.checkOut ?? fallback);

					setMenuAnchor(null);
				}}
			/>
		</Paper>
	);
};
