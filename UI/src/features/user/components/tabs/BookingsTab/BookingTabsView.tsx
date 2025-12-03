import React, { useState, useMemo, useEffect } from "react";
import { Tabs, Tab, Box, Typography, Stack, Pagination } from "@mui/material";
import type { Booking } from "../../../types/Booking";
import BookingDetailItem from "./BookingDetailItem";

type BookingTabsViewProps = {
	bookings: Booking[];
	defaultImage: string; // Dùng cho tất cả ảnh placeholder
};

const BOOKINGS_PER_PAGE = 3;

const BookingTabsView: React.FC<BookingTabsViewProps> = ({ bookings, defaultImage }) => {
	const [currentTab, setCurrentTab] = useState(0);
	const [page, setPage] = useState(1);

	const handleChange = (_: React.SyntheticEvent, newValue: number) => {
		setCurrentTab(newValue);
	};

	const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
		setPage(value);
	};

	useEffect(() => {
		setPage(1);
	}, [currentTab]);

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

	const paginatedBookings = filteredBookings.slice((page - 1) * BOOKINGS_PER_PAGE, page * BOOKINGS_PER_PAGE);

	return (
		<Box>
			<Tabs value={currentTab} onChange={handleChange} variant="standard" textColor="primary" indicatorColor="primary">
				<Tab label="All" />
				<Tab label="Upcoming" />
				<Tab label="Completed" />
				<Tab label="Canceled" />
			</Tabs>

			<Box mt={2}>
				{paginatedBookings.length === 0 ? (
					<Typography variant="body2" color="text.secondary">
						No bookings found.
					</Typography>
				) : (
					paginatedBookings.map((b) => <BookingDetailItem key={b.id} booking={b} image={defaultImage} />)
				)}
			</Box>
			{filteredBookings.length > BOOKINGS_PER_PAGE && (
				<Stack alignItems="center" mt={3}>
					<Pagination count={Math.ceil(filteredBookings.length / BOOKINGS_PER_PAGE)} page={page} onChange={handlePageChange} />
				</Stack>
			)}
		</Box>
	);
};

export default BookingTabsView;
