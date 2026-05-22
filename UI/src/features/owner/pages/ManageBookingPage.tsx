import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
	Box,
	Autocomplete,
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
	Pagination,
	Select,
	Stack,
	Tab,
	Tabs,
	TextField,
	Tooltip,
	Typography,
} from "@mui/material";
import { AddRounded, CalendarMonthOutlined, ChevronLeft, ChevronRight, ErrorOutlineOutlined, KeyboardArrowDownRounded, Refresh, RemoveRounded, RestartAltOutlined } from "@mui/icons-material";
import { useOwnerAccommodations } from "../hooks/useOwnerAccommodations";
import { useOwnerBookings, useRevokeOwnerBooking } from "../hooks/useOwnerBookings";
import type { OwnerBookingListItem, OwnerBookingSort, OwnerBookingStatus, OwnerPaymentStatus } from "../types/owner.types";
import { usePushNotificationContext } from "../../../context/PushNotification/hook";

type BookingTabValue = OwnerBookingStatus | "ALL";
type IncomingTimelineUnit = "days" | "weeks" | "months";

const BOOKINGS_PER_PAGE = 5;

const BOOKING_TABS: { label: string; value: BookingTabValue }[] = [
	{ label: "All bookings", value: "ALL" },
	{ label: "Incoming", value: "BOOKED" },
	{ label: "Cancelled", value: "CANCELLED" },
	{ label: "Completed", value: "COMPLETED" },
];

const getStatusFromParams = (params: URLSearchParams): BookingTabValue => {
	const status = params.get("status")?.toUpperCase();
	return BOOKING_TABS.some((tab) => tab.value === status) ? (status as BookingTabValue) : "BOOKED";
};

const SORT_OPTIONS: { label: string; value: OwnerBookingSort }[] = [
	{ label: "Newest", value: "newest" },
	{ label: "Oldest", value: "oldest" },
	{ label: "Total price: high to low", value: "price_desc" },
	{ label: "Total price: low to high", value: "price_asc" },
];

const filterInputSx = {
	"& .MuiInputBase-root": {
		minHeight: 56,
		backgroundColor: "background.paper",
		borderRadius: 1,
		transition: "border-color 0.15s ease, background-color 0.15s ease",
		"&:hover": {
			backgroundColor: "action.hover",
		},
	},
	"& .MuiOutlinedInput-notchedOutline": {
		borderColor: "divider",
	},
	"& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline": {
		borderColor: "primary.main",
	},
	"& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
		borderColor: "primary.main",
		borderWidth: 1,
	},
	"& .MuiInputLabel-root.Mui-focused": {
		color: "primary.main",
	},
} as const;

const floatingFilterLabelSx = {
	position: "absolute",
	top: -8,
	left: 12,
	px: 0.5,
	bgcolor: "background.paper",
	color: "text.secondary",
	fontSize: "0.75rem",
	lineHeight: 1,
	fontWeight: 500,
	zIndex: 1,
	pointerEvents: "none",
} as const;

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
	new Intl.DateTimeFormat("en-GB", {
		day: "numeric",
		month: "short",
		year: "numeric",
	}).format(new Date(value));

const formatDateMonthYear = (value: string) =>
	new Intl.DateTimeFormat("en-GB", {
		day: "2-digit",
		month: "2-digit",
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

const paymentLabel = (status: OwnerPaymentStatus) => {
	if (!status || status === "PENDING") return "Not paid yet";
	return status.replaceAll("_", " ");
};

const cancellationSourceLabel = (source: OwnerBookingListItem["noteBy"]) => {
	if (source === "OWNER") return "host";
	if (source === "TRAVELLER") return "traveller";
	if (source === "SYSTEM") return "system";
	return "user";
};

const toDateInputValue = (date: Date) => {
	const year = date.getFullYear();
	const month = `${date.getMonth() + 1}`.padStart(2, "0");
	const day = `${date.getDate()}`.padStart(2, "0");
	return `${year}-${month}-${day}`;
};

const getTodayInputValue = () => toDateInputValue(new Date());
const getMonthStartInputValue = () => {
	const today = new Date();
	return toDateInputValue(new Date(today.getFullYear(), today.getMonth(), 1));
};

const addTimelineToDate = (date: Date, amount: number, unit: IncomingTimelineUnit) => {
	const nextDate = new Date(date);
	if (unit === "days") {
		nextDate.setDate(nextDate.getDate() + amount);
		return nextDate;
	}
	if (unit === "weeks") {
		nextDate.setDate(nextDate.getDate() + amount * 7);
		return nextDate;
	}
	nextDate.setMonth(nextDate.getMonth() + amount);
	return nextDate;
};

const getDateRangeLabel = (fromDay: string, toDay: string) => {
	if (!fromDay && !toDay) return "Select dates";
	if (fromDay && fromDay === toDay) {
		return fromDay === getTodayInputValue() ? "Today" : formatDateMonthYear(`${fromDay}T00:00:00`);
	}
	if (fromDay && toDay) {
		return `${formatDateMonthYear(`${fromDay}T00:00:00`)} - ${formatDateMonthYear(`${toDay}T00:00:00`)}`;
	}
	return fromDay ? `From ${formatDateMonthYear(`${fromDay}T00:00:00`)}` : `Until ${formatDateMonthYear(`${toDay}T00:00:00`)}`;
};

const getMonthGroupLabel = (value: string) =>
	new Intl.DateTimeFormat("en-GB", {
		month: "long",
		year: "numeric",
	}).format(new Date(value));

const groupBookingsByCheckInMonth = (bookings: OwnerBookingListItem[]) =>
	bookings.reduce<{ key: string; label: string; bookings: OwnerBookingListItem[] }[]>((groups, booking) => {
		const date = new Date(booking.startDate);
		const key = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}`;
		const existing = groups.find((group) => group.key === key);
		if (existing) {
			existing.bookings.push(booking);
		} else {
			groups.push({ key, label: getMonthGroupLabel(booking.startDate), bookings: [booking] });
		}
		return groups;
	}, []);

const filterBookingsByAccommodations = (bookings: OwnerBookingListItem[], accommodationIds: string[]) => {
	if (accommodationIds.length <= 1) return bookings;
	const selectedIds = new Set(accommodationIds);
	return bookings.filter((booking) => booking.accommodation?.id && selectedIds.has(booking.accommodation.id));
};

const sortBookingsForDisplay = (bookings: OwnerBookingListItem[], sort: OwnerBookingSort) => {
	if (sort !== "newest" && sort !== "oldest") return bookings;
	return [...bookings].sort((a, b) => {
		const startA = new Date(a.startDate).getTime();
		const startB = new Date(b.startDate).getTime();
		return sort === "oldest" ? startA - startB : startB - startA;
	});
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
								Booking {booking.referenceNo}
							</Typography>
							<Chip size="small" label={booking.status} color={statusColor(booking.status)} />
							{booking.paymentStatus !== "COMPLETED" && <Chip size="small" label={paymentLabel(booking.paymentStatus)} color={paymentColor(booking.paymentStatus)} variant="outlined" />}
						</Stack>
						<Typography variant="body2" color="text.secondary">
							{booking.accommodation?.name ?? "Accommodation"}
						</Typography>
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
							Created
						</Typography>
						<Typography variant="body2" fontWeight={600}>
							{formatDate(booking.createdAt)}
						</Typography>
					</Box>
				</Stack>

				{booking.status === "CANCELLED" && booking.note && (
					<>
						<Divider sx={{ my: 2 }} />
						<Box>
							<Typography variant="caption" color="text.secondary">
								Cancellation reason from {cancellationSourceLabel(booking.noteBy)}
							</Typography>
							<Typography variant="body2" sx={{ mt: 0.5 }}>
								{booking.note}
							</Typography>
						</Box>
					</>
				)}
			</CardContent>
		</Card>
	);
};

const ManageBookingPage = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [status, setStatus] = useState<BookingTabValue>(() => getStatusFromParams(searchParams));
	const [accommodationIds, setAccommodationIds] = useState<string[]>([]);
	const [fromDay, setFromDay] = useState(() => getMonthStartInputValue());
	const [toDay, setToDay] = useState(() => getTodayInputValue());
	const [incomingAmount, setIncomingAmount] = useState(2);
	const [incomingUnit, setIncomingUnit] = useState<IncomingTimelineUnit>("months");
	const [sort, setSort] = useState<OwnerBookingSort>("newest");
	const [page, setPage] = useState(1);
	const [bookingToRevoke, setBookingToRevoke] = useState<OwnerBookingListItem | null>(null);
	const [revokeNote, setRevokeNote] = useState("");
	const [dayAnchorEl, setDayAnchorEl] = useState<HTMLElement | null>(null);
	const [monthOffset, setMonthOffset] = useState(0);

	const { pushNotification } = usePushNotificationContext();
	const { data: accommodations = [] } = useOwnerAccommodations();
	const incomingToDay = useMemo(() => toDateInputValue(addTimelineToDate(new Date(), Math.max(0, incomingAmount), incomingUnit)), [incomingAmount, incomingUnit]);
	const shouldUseCheckInRange = status !== "BOOKED";
	const filters = useMemo(
		() => ({
			status: status === "ALL" ? undefined : status,
			accommodationId: accommodationIds.length === 1 ? accommodationIds[0] : undefined,
			fromDay: status === "BOOKED" ? getTodayInputValue() : shouldUseCheckInRange ? fromDay || undefined : undefined,
			toDay: status === "BOOKED" ? incomingToDay : shouldUseCheckInRange ? toDay || undefined : undefined,
			sort,
		}),
		[status, accommodationIds, fromDay, toDay, incomingToDay, shouldUseCheckInRange, sort]
	);
	const { data: bookings = [], isLoading, isError, refetch } = useOwnerBookings(filters);
	const revokeBooking = useRevokeOwnerBooking();
	const filteredBookings = useMemo(() => sortBookingsForDisplay(filterBookingsByAccommodations(bookings, accommodationIds), sort), [bookings, accommodationIds, sort]);
	const pageCount = Math.max(1, Math.ceil(filteredBookings.length / BOOKINGS_PER_PAGE));
	const paginatedBookings = useMemo(() => filteredBookings.slice((page - 1) * BOOKINGS_PER_PAGE, page * BOOKINGS_PER_PAGE), [filteredBookings, page]);
	const bookingGroups = useMemo(() => groupBookingsByCheckInMonth(paginatedBookings), [paginatedBookings]);

	useEffect(() => {
		setStatus(getStatusFromParams(searchParams));
	}, [searchParams]);

	useEffect(() => {
		setPage(1);
	}, [status, accommodationIds, fromDay, toDay, incomingAmount, incomingUnit, sort]);

	const handleStatusChange = (value: BookingTabValue) => {
		setStatus(value);
		const nextParams = new URLSearchParams(searchParams);
		nextParams.set("status", value);
		setSearchParams(nextParams, { replace: true });
	};

	const handleRevoke = async () => {
		if (!bookingToRevoke) return;

		try {
			await revokeBooking.mutateAsync({ bookingId: bookingToRevoke.id, note: revokeNote.trim() || undefined });
			pushNotification("Booking revoked successfully.", "success");
			setBookingToRevoke(null);
			setRevokeNote("");
		} catch (error) {
			pushNotification(error instanceof Error ? error.message : "Failed to revoke booking.", "error");
		}
	};

	const closeRevokeDialog = () => {
		setBookingToRevoke(null);
		setRevokeNote("");
	};

	const clearFilters = () => {
		setAccommodationIds([]);
		setFromDay(getMonthStartInputValue());
		setToDay(getTodayInputValue());
		setIncomingAmount(2);
		setIncomingUnit("months");
		setSort("newest");
		setPage(1);
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
				<Tooltip title="Refresh bookings" arrow>
					<IconButton color="primary" onClick={() => refetch()} aria-label="Refresh bookings" sx={{ border: "1px solid", borderColor: "divider" }}>
						<Refresh />
					</IconButton>
				</Tooltip>
			</Stack>

			<Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, mb: 3 }}>
				<CardContent sx={{ p: 2.5 }}>
					<Tabs value={status} onChange={(_, value: BookingTabValue) => handleStatusChange(value)} sx={{ mb: 2 }}>
						{BOOKING_TABS.map((tab) => (
							<Tab key={tab.value} label={tab.label} value={tab.value} />
						))}
					</Tabs>

					<Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="flex-start">
						<Autocomplete
							multiple
							fullWidth
							disableCloseOnSelect
							filterSelectedOptions
							options={accommodations}
							value={accommodations.filter((acc) => accommodationIds.includes(acc.id))}
							getOptionLabel={(option) => option.name}
							onChange={(_, value) => setAccommodationIds(value.map((acc) => acc.id))}
							slotProps={{
								paper: {
									elevation: 4,
									sx: {
										mt: 0.75,
										border: "1px solid",
										borderColor: "divider",
										borderRadius: 1,
										overflow: "hidden",
									},
								},
							}}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Accommodation name"
									placeholder={accommodationIds.length === 0 ? "Search by accommodation name" : ""}
								/>
							)}
							sx={{
								...filterInputSx,
								flex: "1 1 520px",
								minWidth: { xs: "100%", md: 380 },
								"& .MuiInputBase-root": {
									...filterInputSx["& .MuiInputBase-root"],
									alignContent: accommodationIds.length === 0 ? "center" : "flex-start",
									alignItems: "center",
									height: "auto",
									minHeight: 56,
									py: accommodationIds.length === 0 ? 0 : 0.75,
								},
								"& .MuiAutocomplete-input": {
									flexGrow: 1,
									minWidth: "140px !important",
									py: "0 !important",
								},
							}}
						/>

						{status === "BOOKED" ? (
							<Stack direction="row" spacing={1.5} sx={{ flex: "0 0 auto", width: { xs: "100%", md: "auto" } }}>
								<Box
									sx={{
										width: { xs: "100%", md: 190 },
										height: 56,
										position: "relative",
										px: 1,
										border: "1px solid",
										borderColor: "divider",
										borderRadius: 1,
										bgcolor: "background.paper",
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										transition: "border-color 0.15s ease, background-color 0.15s ease",
										"&:hover": {
											borderColor: "primary.main",
											bgcolor: "action.hover",
										},
									}}
								>
									<Typography sx={floatingFilterLabelSx}>Incoming</Typography>
									<Box sx={{ px: 0.75, minWidth: 0 }}>
										<Typography sx={{ fontSize: "1.15rem", lineHeight: 1.2 }}>
											{incomingAmount}
										</Typography>
									</Box>
									<Stack direction="row" spacing={0.75} alignItems="center">
										<IconButton
											size="small"
											onClick={() => setIncomingAmount((current) => Math.max(0, current - 1))}
											aria-label="Decrease incoming range"
											sx={{ border: "1px solid", borderColor: "divider", bgcolor: "background.paper", "&:hover": { borderColor: "primary.main" } }}
										>
											<RemoveRounded fontSize="small" />
										</IconButton>
										<IconButton
											size="small"
											onClick={() => setIncomingAmount((current) => current + 1)}
											aria-label="Increase incoming range"
											sx={{ border: "1px solid", borderColor: "divider", bgcolor: "background.paper", "&:hover": { borderColor: "primary.main" } }}
										>
											<AddRounded fontSize="small" />
										</IconButton>
									</Stack>
								</Box>
								<FormControl sx={{ ...filterInputSx, width: { xs: "100%", md: 170 } }}>
									<InputLabel>Timeline</InputLabel>
									<Select label="Timeline" value={incomingUnit} onChange={(event) => setIncomingUnit(event.target.value as IncomingTimelineUnit)}>
										<MenuItem value="days">Days</MenuItem>
										<MenuItem value="weeks">Weeks</MenuItem>
										<MenuItem value="months">Months</MenuItem>
									</Select>
								</FormControl>
							</Stack>
						) : (
							<Box sx={{ width: "100%", position: "relative" }}>
								<Box
									onClick={(event) => setDayAnchorEl(event.currentTarget)}
									sx={{
										height: 56,
										position: "relative",
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
									<Typography sx={floatingFilterLabelSx}>Check-in range</Typography>
									<CalendarMonthOutlined sx={{ mr: 1.25, fontSize: 20, color: "primary.main" }} />
									<Box sx={{ minWidth: 0, flexGrow: 1 }}>
										<Typography variant="body2" fontWeight={700} noWrap>
											{getDateRangeLabel(fromDay, toDay)}
										</Typography>
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
						)}

						<FormControl fullWidth sx={filterInputSx}>
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
			) : filteredBookings.length === 0 ? (
				<Box sx={{ textAlign: "center", py: 8, border: "1px solid", borderColor: "divider", borderRadius: 2, backgroundColor: "background.paper" }}>
					<Typography variant="h5" fontWeight={800} color="primary.main" sx={{ letterSpacing: 0 }}>
						No booking found
					</Typography>
					<Typography variant="body1" color="text.secondary" mt={1}>
						Change the status tab or check-in date to view other bookings.
					</Typography>
				</Box>
			) : (
				<Stack spacing={3}>
					{bookingGroups.map((group) => (
						<Box key={group.key}>
							<Typography variant="subtitle1" fontWeight={800} color="text.primary" mb={1.5}>
								{group.label}
							</Typography>
							<Stack spacing={2}>
								{group.bookings.map((booking) => (
									<BookingCard key={booking.id} booking={booking} onRevoke={setBookingToRevoke} />
								))}
							</Stack>
						</Box>
					))}
					{filteredBookings.length > BOOKINGS_PER_PAGE && (
						<Box display="flex" justifyContent="center" pt={1}>
							<Pagination count={pageCount} page={page} onChange={(_, value) => setPage(value)} color="primary" />
						</Box>
					)}
				</Stack>
			)}

			<Dialog open={!!bookingToRevoke} onClose={closeRevokeDialog} maxWidth="xs" fullWidth>
				<DialogTitle>Revoke booking</DialogTitle>
				<DialogContent>
					<Typography>Are you sure you want to revoke this booking?</Typography>
					{bookingToRevoke && (
						<Typography variant="body2" color="text.secondary" mt={1}>
							Booking {bookingToRevoke.referenceNo} will be moved to cancelled.
						</Typography>
					)}
					<TextField
						label="Cancellation note"
						placeholder="Optional reason for the traveller"
						value={revokeNote}
						onChange={(event) => setRevokeNote(event.target.value)}
						fullWidth
						multiline
						minRows={3}
						margin="normal"
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={closeRevokeDialog}>Cancel</Button>
					<Button color="error" variant="contained" onClick={handleRevoke} disabled={revokeBooking.isPending}>
						Revoke
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default ManageBookingPage;
