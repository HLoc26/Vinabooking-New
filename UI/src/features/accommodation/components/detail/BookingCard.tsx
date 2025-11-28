import { Paper, Typography, TextField, Button, Box, Divider, Stack } from "@mui/material";
import { ProtectedLink } from "../../../../components/shared/ProtectedLink";
import { usePushNotificationContext } from "../../../../context/PushNotification/hook";
import type { ItemInfo } from "../../../../types/BookingContextInfo";
import { toInputDate } from "../../../../utils/dateFormatter";

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
				<TextField
					label="Check-in"
					type="date"
					fullWidth
					slotProps={{ inputLabel: { shrink: true } }}
					value={toInputDate(startDate)}
					onChange={(e) => onStartDateChange(new Date(e.target.value))}
				/>
				<TextField
					label="Check-out"
					type="date"
					fullWidth
					slotProps={{ inputLabel: { shrink: true } }}
					value={toInputDate(endDate)}
					onChange={(e) => onEndDateChange(new Date(e.target.value))}
				/>
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
		</Paper>
	);
};
