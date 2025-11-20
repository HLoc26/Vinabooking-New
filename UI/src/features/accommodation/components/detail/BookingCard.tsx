import { Paper, Typography, TextField, Button, Box, Divider, Stack } from "@mui/material";

interface Props {
	nights: number;
	totalPrice: number;
	startDate: Date;
	endDate: Date;
	onStartDateChange: (date: Date) => void;
	onEndDateChange: (date: Date) => void;
}

export const BookingCard = ({ nights, totalPrice, startDate, endDate, onStartDateChange, onEndDateChange }: Props) => {
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
					${totalPrice.toFixed(0)}
				</Typography>
			</Box>
			<Divider sx={{ my: 2 }} />
			<Stack spacing={2}>
				<TextField
					label="Check-in"
					type="date"
					fullWidth
					InputLabelProps={{ shrink: true }}
					value={startDate.toISOString().split("T")[0]}
					onChange={(e) => onStartDateChange(new Date(e.target.value))}
				/>
				<TextField
					label="Check-out"
					type="date"
					fullWidth
					InputLabelProps={{ shrink: true }}
					value={endDate.toISOString().split("T")[0]}
					onChange={(e) => onEndDateChange(new Date(e.target.value))}
				/>
				<Button variant="contained" size="large" fullWidth>
					Reserve Now
				</Button>
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
