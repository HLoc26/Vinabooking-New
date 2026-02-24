import { Paper, Typography, Button, Box, Divider, Stack } from "@mui/material";
import { ProtectedLink } from "../../../../components/shared/ProtectedLink";
import { usePushNotificationContext } from "../../../../context/PushNotification/hook";
import type { ItemInfo } from "../../../../types/BookingContextInfo";
import { DatePickerMenu } from "../../../../components/shared/DatePickerMenu";
import { useState, useEffect } from "react";
import { type Dates } from "../../../../types/Query";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import type { RootState } from "../../../../app/store";
import { setBookingField } from "../../../booking/bookingSlice";

interface Props {
	rooms: ItemInfo[];
	nights: number;
	totalPrice: number;
}

export const BookingCard = ({ rooms, nights, totalPrice }: Props) => {
	const { pushNotification } = usePushNotificationContext();
	const dispatch = useDispatch();
	const [searchParams, setSearchParams] = useSearchParams();
	const bookingInfo = useSelector((state: RootState) => state.booking);

	const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
	const [dates, setDates] = useState<Dates>({
		checkIn: bookingInfo.startDate,
		checkOut: bookingInfo.endDate,
	});

	useEffect(() => {
		setDates({
			checkIn: bookingInfo.startDate,
			checkOut: bookingInfo.endDate,
		});
	}, [bookingInfo.startDate, bookingInfo.endDate]);

	const handleOpenMenu = (e: React.MouseEvent<HTMLElement>) => {
		setDates({
			checkIn: bookingInfo.startDate,
			checkOut: bookingInfo.endDate,
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
						{bookingInfo.startDate.toLocaleDateString()} — {bookingInfo.endDate?.toLocaleDateString()}
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
					const newCheckIn = dates.checkIn;
					let newCheckOut = dates.checkOut;

					if (!newCheckOut) {
						newCheckOut = new Date(newCheckIn);
						newCheckOut.setDate(newCheckOut.getDate() + 2);
					}

					dispatch(setBookingField({ key: "startDate", value: newCheckIn }));
					dispatch(setBookingField({ key: "endDate", value: newCheckOut }));

					const newParams = new URLSearchParams(searchParams);
					newParams.set("checkIn", newCheckIn.toLocaleDateString("sv-SE"));
					newParams.set("checkOut", newCheckOut.toLocaleDateString("sv-SE"));
					setSearchParams(newParams, { replace: true });

					setMenuAnchor(null);
				}}
			/>
		</Paper>
	);
};
