import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	FormControl,
	IconButton,
	InputLabel,
	Menu,
	MenuItem,
	Select,
	Stack,
	Tab,
	Tabs,
	Typography,
} from "@mui/material";
import { CalendarMonthOutlined, ChevronLeft, ChevronRight, ErrorOutlineOutlined, KeyboardArrowDownRounded, Refresh, RestartAltOutlined } from "@mui/icons-material";
import { useOwnerAccommodations } from "../hooks/useOwnerAccommodations";
import { useOwnerBookings, useRevokeOwnerBooking } from "../hooks/useOwnerBookings";
import type { OwnerBookingListItem, OwnerBookingSort, OwnerBookingStatus, OwnerPaymentStatus } from "../types/owner.types";
import { usePushNotificationContext } from "../../../context/PushNotification/hook";

const BOOKING_TABS: { label: string; value: OwnerBookingStatus }[] = [
	{ label: "Pending", value: "PENDING" },
	{ label: "Cancelled", value: "CANCELLED" },
	{ label: "Booked", value: "BOOKED" },
	{ label: "Completed", value: "COMPLETED" },
];

const getStatusFromParams = (params: URLSearchParams): OwnerBookingStatus => {
	const status = params.get("status")?.toUpperCase();
	return BOOKING_TABS.some((tab) => tab.value === status) ? (status as OwnerBookingStatus) : "PENDING";
};

const SORT_OPTIONS: { label: string; value: OwnerBookingSort }[] = [
	{ label: "Newest", value: "newest" },
	{ label: "Oldest", value: "oldest" },
	{ label: "Total price: high to low", value: "price_desc" },
	{ label: "Total price: low to high", value: "price_asc" },
];

const statusColor = (status: OwnerBookingStatus): "warning" | "error" | "primary" | "success" => {
	if (status === "PENDING") return "warning";
	if (status === "CANCELLED") return "error";
	if (status === "COMPLETED") return "success";
	return "primary";
};

const paymentColor = (status: OwnerPaymentStatus): "default" | "warning" | "error" | "success" => {
	if (!status || status === "PENDING") return "warning";
	if (status === "COMPLETED") return "success";
	if (status === "FAILED" || status === "DISMISSED") return "error";
	return "default";
};

const formatDate = (value: string) =>
	new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(new Date(value));

const formatMoney = (value: string | null) => {
	const amount = Number(value ?? 0);
	return amount.toLocaleString("en-US", {
		style: "currency",
		currency: "VND",
		maximumFractionDigits: 0,
	});
};

const paymentLabel = (status: OwnerPaymentStatus) => (status ? status.replaceAll("_", " ") : "Unpaid");

const toDateInputValue = (date: Date) => {
	const year = date.getFullYear();
	const month = `${date.getMonth() + 1}`.padStart(2, "0");
	const day = `${date.getDate()}`.padStart(2, "0");
	return `${year}-${month}-${day}`;
};

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => {
	const day = new Date(year, month, 1).getDay();
	return day === 0 ? 6 : day - 1;
};

const RangeDateCalendar = ({ viewDate, fromDay, toDay, onSelect }: { viewDate: Date; fromDay: string; toDay: string; onSelect: (date: Date) => void }) => {
	const year = viewDate.getFullYear();
	const month = viewDate.getMonth();
	const days = Array.from({ length: getDaysInMonth(year, month) }, (_, index) => index + 1);
	const blanks = Array.from({ length: getFirstDayOfMonth(year, month) }, (_, index) => index);
	const fromDate = fromDay ? new Date(`${fromDay}T00:00:00`) : null;
	const toDate = toDay ? new Date(`${toDay}T00:00:00`) : null;

	return (
		<Box width={280} p={1}>
			<Typography align="center" fontWeight={700} mb={2} variant="subtitle2">
				{viewDate.toLocaleString("default", { month: "long", year: "numeric" })}
			</Typography>
			<Box display="grid" gridTemplateColumns="repeat(7, 1fr)" textAlign="center" mb={1}>
				{["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((weekday) => (
					<Typography key={weekday} variant="caption" color="text.secondary" fontWeight="bold">
						{weekday}
					</Typography>
				))}
			</Box>
			<Box display="grid" gridTemplateColumns="repeat(7, 1fr)" textAlign="center" gap={0.5}>
				{blanks.map((blank) => (
					<Box key={`blank-${blank}`} />
				))}
				{days.map((calendarDay) => {
					const date = new Date(year, month, calendarDay);
					const selected = fromDay === toDateInputValue(date) || toDay === toDateInputValue(date);
					const inRange = !!fromDate && !!toDate && date > fromDate && date < toDate;
					return (
						<Button
							key={calendarDay}
							variant="text"
							onClick={(event) => {
								event.stopPropagation();
								onSelect(date);
							}}
							sx={{
								borderRadius: "50%",
								minWidth: 32,
								height: 32,
								p: 0,
								fontSize: "0.85rem",
								bgcolor: selected ? "primary.main" : inRange ? "primary.light" : "transparent",
								color: selected ? "primary.contrastText" : inRange ? "primary.contrastText" : "text.primary",
								"&:hover": {
									bgcolor: selected ? "primary.dark" : "action.hover",
								},
							}}
						>
							{calendarDay}
						</Button>
					);
				})}
			</Box>
		</Box>
	);
};

const BookingCard = ({ booking, onRevoke }: { booking: OwnerBookingListItem; onRevoke: (booking: OwnerBookingListItem) => void }) => {
	const canRevoke = booking.status === "PENDING" || booking.status === "BOOKED";
	const primaryItem = booking.items[0];
	const itemText = booking.items.map((item) => `${item.name} x${item.count}`).join(", ");

	return (
		<Card
			elevation={0}
			sx={{
				border: "1px solid",
				borderColor: "divider",
				borderRadius: 2,
				backgroundColor: "background.paper",
			}}
		>
			<CardContent sx={{ p: 2.5 }}>
				<Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }}>
					<Box sx={{ minWidth: 0 }}>
						<Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" mb={1}>
							<Typography variant="h6" fontWeight={700}>
								{booking.accommodation?.name ?? "Accommodation"}
							</Typography>
							<Chip size="small" label={booking.status} color={statusColor(booking.status)} />
							<Chip size="small" label={paymentLabel(booking.paymentStatus)} color={paymentColor(booking.paymentStatus)} variant="outlined" />
						</Stack>
						<Typography variant="body2" color="text.secondary">
							{primaryItem?.type === "BED" ? "Bed" : "Room"}: {itemText || "-"}
						</Typography>
					</Box>

					<Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
						<Typography variant="h6" fontWeight={700} color="primary.main">
							{formatMoney(booking.totalPrice)}
						</Typography>
						{canRevoke && (
							<Button variant="outlined" color="error" size="small" onClick={() => onRevoke(booking)}>
								Revoke
							</Button>
						)}
					</Stack>
				</Stack>

				<Divider sx={{ my: 2 }} />

				<Stack direction={{ xs: "column", lg: "row" }} spacing={2.5} justifyContent="space-between">
					<Box>
						<Typography variant="caption" color="text.secondary">
							Guest
						</Typography>
						<Typography variant="body2" fontWeight={600}>
							{booking.leaderName || booking.guest.name || "Guest"}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{booking.leaderEmail || booking.guest.email}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{booking.phone || booking.guest.phone || "-"}
						</Typography>
					</Box>

					<Box>
						<Typography variant="caption" color="text.secondary">
							Stay
						</Typography>
						<Stack direction="row" spacing={1} alignItems="center">
							<CalendarMonthOutlined sx={{ fontSize: 16, color: "text.secondary" }} />
							<Typography variant="body2" fontWeight={600}>
								{formatDate(booking.startDate)} - {formatDate(booking.endDate)}
							</Typography>
						</Stack>
						<Typography variant="body2" color="text.secondary">
							{booking.nights} night{booking.nights === 1 ? "" : "s"} - {booking.guestCount} guest{booking.guestCount === 1 ? "" : "s"}
						</Typography>
					</Box>

					<Box>
						<Typography variant="caption" color="text.secondary">
							Reference
						</Typography>
						<Typography variant="body2" fontWeight={600}>
							#{booking.referenceNo}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Created {formatDate(booking.createdAt)}
						</Typography>
					</Box>
				</Stack>
			</CardContent>
		</Card>
	);
};

const ManageBookingPage = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [status, setStatus] = useState<OwnerBookingStatus>(() => getStatusFromParams(searchParams));
	const [accommodationId, setAccommodationId] = useState("");
	const [fromDay, setFromDay] = useState("");
	const [toDay, setToDay] = useState("");
	const [sort, setSort] = useState<OwnerBookingSort>("newest");
	const [bookingToRevoke, setBookingToRevoke] = useState<OwnerBookingListItem | null>(null);
	const [dayAnchorEl, setDayAnchorEl] = useState<HTMLElement | null>(null);
	const [monthOffset, setMonthOffset] = useState(0);

	const { pushNotification } = usePushNotificationContext();
	const { data: accommodations = [] } = useOwnerAccommodations();
	const filters = useMemo(() => ({ status, accommodationId: accommodationId || undefined, fromDay: fromDay || undefined, toDay: toDay || undefined, sort }), [status, accommodationId, fromDay, toDay, sort]);
	const { data: bookings = [], isLoading, isError, refetch } = useOwnerBookings(filters);
	const revokeBooking = useRevokeOwnerBooking();

	useEffect(() => {
		setStatus(getStatusFromParams(searchParams));
	}, [searchParams]);

	const handleStatusChange = (value: OwnerBookingStatus) => {
		setStatus(value);
		const nextParams = new URLSearchParams(searchParams);
		nextParams.set("status", value);
		setSearchParams(nextParams, { replace: true });
	};

	const handleRevoke = async () => {
		if (!bookingToRevoke) return;

		try {
			await revokeBooking.mutateAsync(bookingToRevoke.id);
			pushNotification("Booking revoked successfully.", "success");
			setBookingToRevoke(null);
		} catch (error) {
			pushNotification(error instanceof Error ? error.message : "Failed to revoke booking.", "error");
		}
	};

	const clearFilters = () => {
		setAccommodationId("");
		setFromDay("");
		setToDay("");
		setSort("newest");
		setMonthOffset(0);
	};

	const handleRangeSelect = (date: Date) => {
		const value = toDateInputValue(date);
		if (!fromDay || toDay) {
			setFromDay(value);
			setToDay("");
			return;
		}

		if (value < fromDay) {
			setToDay(fromDay);
			setFromDay(value);
		} else {
			setToDay(value);
			setDayAnchorEl(null);
		}
	};

	const dateBase = fromDay ? new Date(`${fromDay}T00:00:00`) : new Date();
	const viewDate = new Date(dateBase.getFullYear(), dateBase.getMonth() + monthOffset, 1);

	return (
		<Box sx={{ pb: 4 }}>
			<Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2} mb={3}>
				<Box>
					<Typography variant="h4" fontWeight={800} color="primary.main">
						Manage Booking
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Review reservations, payment state, and guest stay details.
					</Typography>
				</Box>
				<Button startIcon={<Refresh />} variant="outlined" onClick={() => refetch()}>
					Refresh
				</Button>
			</Stack>

			<Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, mb: 3 }}>
				<CardContent sx={{ p: 2.5 }}>
					<Tabs value={status} onChange={(_, value: OwnerBookingStatus) => handleStatusChange(value)} sx={{ mb: 2 }}>
						{BOOKING_TABS.map((tab) => (
							<Tab key={tab.value} label={tab.label} value={tab.value} />
						))}
					</Tabs>

					<Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="stretch">
						<FormControl fullWidth sx={{ "& .MuiInputBase-root": { minHeight: 56 } }}>
							<InputLabel>Accommodation</InputLabel>
							<Select label="Accommodation" value={accommodationId} onChange={(event) => setAccommodationId(event.target.value)}>
								<MenuItem value="">All accommodations</MenuItem>
								{accommodations.map((acc) => (
									<MenuItem key={acc.id} value={acc.id}>
										{acc.name}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						<Box sx={{ width: "100%", position: "relative" }}>
							<Box
								onClick={(event) => setDayAnchorEl(event.currentTarget)}
								sx={{
									height: 56,
									px: 1.75,
									border: "1px solid",
									borderColor: dayAnchorEl ? "primary.main" : "divider",
									borderRadius: 1,
									display: "flex",
									alignItems: "center",
									cursor: "pointer",
									bgcolor: "background.paper",
									transition: "border-color 0.15s ease, background-color 0.15s ease",
									"&:hover": {
										borderColor: "primary.main",
										bgcolor: "action.hover",
									},
								}}
							>
								<CalendarMonthOutlined sx={{ mr: 1.25, fontSize: 20, color: "primary.main" }} />
									<Box sx={{ minWidth: 0, flexGrow: 1 }}>
									<Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: "block", lineHeight: 1 }}>
										Check-in range
									</Typography>
									<Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
										<Typography variant="body2" fontWeight={700} noWrap>
											{fromDay ? formatDate(`${fromDay}T00:00:00`) : "From date"}
										</Typography>
										<Typography variant="body2" color="text.secondary">
											to
										</Typography>
										<Typography variant="body2" fontWeight={700} noWrap>
											{toDay ? formatDate(`${toDay}T00:00:00`) : "To date"}
										</Typography>
									</Stack>
								</Box>
								<KeyboardArrowDownRounded sx={{ color: "text.secondary", ml: 1 }} />
							</Box>
							<Menu
								open={!!dayAnchorEl}
								anchorEl={dayAnchorEl}
								onClose={() => setDayAnchorEl(null)}
								anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
								disableAutoFocusItem
								slotProps={{ list: { onClick: (event) => event.stopPropagation() } }}
							>
								<Box display="flex" alignItems="center" justifyContent="space-between" px={1.5} py={1}>
									<IconButton size="small" onClick={() => setMonthOffset((current) => current - 1)}>
										<ChevronLeft fontSize="small" />
									</IconButton>
									<Typography variant="subtitle2" fontWeight={800}>
										Check-in range
									</Typography>
									<IconButton size="small" onClick={() => setMonthOffset((current) => current + 1)}>
										<ChevronRight fontSize="small" />
									</IconButton>
								</Box>
								<RangeDateCalendar
									viewDate={viewDate}
									fromDay={fromDay}
									toDay={toDay}
									onSelect={handleRangeSelect}
								/>
							</Menu>
						</Box>

						<FormControl fullWidth sx={{ "& .MuiInputBase-root": { minHeight: 56 } }}>
							<InputLabel>Sort</InputLabel>
							<Select label="Sort" value={sort} onChange={(event) => setSort(event.target.value as OwnerBookingSort)}>
								{SORT_OPTIONS.map((option) => (
									<MenuItem key={option.value} value={option.value}>
										{option.label}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						<Button variant="text" startIcon={<RestartAltOutlined />} onClick={clearFilters} sx={{ flexShrink: 0, minHeight: 56 }}>
							Clear
						</Button>
					</Stack>
				</CardContent>
			</Card>

			{isLoading ? (
				<Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
					<CircularProgress />
				</Box>
			) : isError ? (
				<Box sx={{ textAlign: "center", py: 8, border: "1px solid", borderColor: "divider", borderRadius: 2, backgroundColor: "background.paper" }}>
					<ErrorOutlineOutlined color="error" sx={{ fontSize: 48, mb: 1 }} />
					<Typography variant="h6" fontWeight={700}>
						Failed to load bookings
					</Typography>
					<Typography variant="body2" color="text.secondary" mb={2}>
						Please try again.
					</Typography>
					<Button variant="outlined" startIcon={<Refresh />} onClick={() => refetch()}>
						Try Again
					</Button>
				</Box>
			) : bookings.length === 0 ? (
				<Box sx={{ textAlign: "center", py: 8, border: "1px solid", borderColor: "divider", borderRadius: 2, backgroundColor: "background.paper" }}>
					<Typography variant="h6" fontWeight={700}>
						No bookings found
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Change the status tab or filters to view other bookings.
					</Typography>
				</Box>
			) : (
				<Stack spacing={2}>
					{bookings.map((booking) => (
						<BookingCard key={booking.id} booking={booking} onRevoke={setBookingToRevoke} />
					))}
				</Stack>
			)}

			<Dialog open={!!bookingToRevoke} onClose={() => setBookingToRevoke(null)} maxWidth="xs" fullWidth>
				<DialogTitle>Revoke booking</DialogTitle>
				<DialogContent>
					<Typography>Are you sure you want to revoke this booking?</Typography>
					{bookingToRevoke && (
						<Typography variant="body2" color="text.secondary" mt={1}>
							Reference #{bookingToRevoke.referenceNo} will be moved to cancelled.
						</Typography>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setBookingToRevoke(null)}>Cancel</Button>
					<Button color="error" variant="contained" onClick={handleRevoke} disabled={revokeBooking.isPending}>
						Revoke
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default ManageBookingPage;
