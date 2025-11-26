import React, { useState, useMemo } from "react";
import { Tabs, Tab, Box, Typography } from "@mui/material";
import type { Booking } from "../../../types/Booking";
import BookingDetailItem from "./BookingDetailItem";

type BookingTabsViewProps = {
	bookings: Booking[];
	defaultImage: string; // Dùng cho tất cả ảnh placeholder
};

const BookingTabsView: React.FC<BookingTabsViewProps> = ({ bookings, defaultImage }) => {
	const [currentTab, setCurrentTab] = useState(0);

	const handleChange = (_: React.SyntheticEvent, newValue: number) => {
		setCurrentTab(newValue);
	};

	const filteredBookings = useMemo(() => {
		switch (currentTab) {
			case 1:
				return bookings.filter((b) => b.status === "BOOKED");
			case 2:
				return bookings.filter((b) => b.status === "COMPLETED");
			case 3:
				return bookings.filter((b) => b.status === "CANCELLED");
			default:
				return bookings;
		}
	}, [currentTab, bookings]);

	return (
		<Box>
			<Tabs value={currentTab} onChange={handleChange} variant="standard" textColor="primary" indicatorColor="primary">
				<Tab label="All" />
				<Tab label="Upcoming" />
				<Tab label="Completed" />
				<Tab label="Canceled" />
			</Tabs>

			<Box mt={2}>
				{filteredBookings.length === 0 ? (
					<Typography variant="body2" color="text.secondary">
						No bookings found.
					</Typography>
				) : (
					filteredBookings.map((b) => <BookingDetailItem key={b.id} booking={b} image={defaultImage} />)
				)}
			</Box>
		</Box>
	);
};

export default BookingTabsView;
