import { Paper, Typography, Grid, Box, Stack, Tooltip, Divider } from "@mui/material";
import {
	Pets,
	SmokingRooms,
	MusicNote,
	InfoOutlined,
	FactCheck,
} from "@mui/icons-material";
import type { ElementType } from "react";
import type { AccommodationDetail } from "../../types/accommodation.types";
import { ECancellationPolicy, EPrepaymentPolicy } from "../../types/accommodation.types";

interface Props {
	accommodation: AccommodationDetail;
}

const CANCELLATION_LABELS: Record<ECancellationPolicy, { label: string; tooltip: string }> = {
	CANCEL_NONE: { label: "Non-refundable", tooltip: "Cancellations or changes are not allowed. You will be charged the total price." },
	CANCEL_24H: { label: "Free cancellation up to 24h before arrival", tooltip: "Get a full refund if you cancel at least 24 hours prior to check-in." },
	CANCEL_48H: { label: "Free cancellation up to 48h before arrival", tooltip: "Get a full refund if you cancel at least 48 hours prior to check-in." },
	CANCEL_7D: { label: "Free cancellation up to 7 days before arrival", tooltip: "Get a full refund if you cancel at least 7 days prior to check-in." },
	CANCEL_14D: { label: "Free cancellation up to 14 days before arrival", tooltip: "Get a full refund if you cancel at least 14 days prior to check-in." },
};

const PREPAYMENT_LABELS: Record<EPrepaymentPolicy, { label: string; tooltip: string }> = {
	PREPAY_NONE: { label: "Pay at property / No prepayment needed", tooltip: "You can pay when you arrive at the property. No deposit is required now." },
	PREPAY_50: { label: "50% Deposit Required", tooltip: "A 50% deposit of the total price is required to secure your booking." },
	PREPAY_100: { label: "100% Full Prepayment Required", tooltip: "The total price of the reservation must be paid in advance to secure your booking." },
};

/**
 * Flat horizontal list item for house rules.
 */
const FlatHouseRule = ({ icon: Icon, label, allowed }: { icon: ElementType; label: string; allowed: boolean }) => (
	<Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 120 }}>
		<Icon sx={{ fontSize: 24, color: allowed ? "success.main" : "text.disabled", opacity: allowed ? 1 : 0.6 }} />
		<Typography
			variant="body1"
			sx={{
				fontWeight: 600,
				color: allowed ? "text.primary" : "text.disabled",
				textDecoration: allowed ? "none" : "line-through",
			}}
		>
			{label}
		</Typography>
	</Stack>
);

export const PropertyPolicies = ({ accommodation }: Props) => {
	const policy = accommodation.policy;

	if (!policy) {
		return (
			<Paper variant="outlined" sx={{ p: 4, borderRadius: 3, bgcolor: "background.paper", boxShadow: "none", textAlign: "center", py: 8 }}>
				<FactCheck sx={{ fontSize: 48, color: "text.disabled", mb: 2, opacity: 0.5 }} />
				<Typography variant="h6" fontWeight="600" color="text.secondary">
					Standard Policies Apply
				</Typography>
				<Typography variant="body2" color="text.disabled">
					The host hasn't specified custom rules. Standard booking terms and local regulations apply.
				</Typography>
			</Paper>
		);
	}

	const overlineSx = {
		fontSize: "0.75rem",
		fontWeight: 700,
		letterSpacing: "0.08em",
		color: "text.secondary",
		mb: 1,
		display: "block",
		textTransform: "uppercase",
	};

	return (
		<Paper variant="outlined" sx={{ p: 4, borderRadius: 3, bgcolor: "background.paper", boxShadow: "none" }}>
			{/* ZONE 1: Arrival & Departure | Booking Conditions */}
			<Grid container spacing={4}>
				{/* Column 1: Arrival & Departure */}
				<Grid size={{ xs: 12, md: 6 }}>
					<Typography variant="h6" fontWeight="700" mb={3}>
						Arrival & Departure
					</Typography>
					<Stack direction="row" spacing={6} sx={{ flexWrap: "wrap", rowGap: 4 }}>
						<Box>
							<Typography sx={overlineSx}>CHECK-IN</Typography>
							<Typography variant="h3" fontWeight={800} color="grey.900" sx={{ letterSpacing: "-0.02em" }}>
								{policy.checkInTime}
							</Typography>
						</Box>
						<Box>
							<Typography sx={overlineSx}>CHECK-OUT</Typography>
							<Typography variant="h3" fontWeight={800} color="grey.900" sx={{ letterSpacing: "-0.02em" }}>
								{policy.checkOutTime}
							</Typography>
						</Box>
					</Stack>
				</Grid>

				{/* Column 2: Booking Conditions */}
				<Grid size={{ xs: 12, md: 6 }}>
					<Typography variant="h6" fontWeight="700" mb={3}>
						Booking Conditions
					</Typography>
					<Stack spacing={4}>
						<Box>
							<Stack direction="row" alignItems="center" spacing={1}>
								<Typography sx={{ ...overlineSx, mb: 0 }}>CANCELLATION</Typography>
								<Tooltip title={CANCELLATION_LABELS[policy.cancellationPolicy].tooltip} placement="top" arrow>
									<InfoOutlined sx={{ fontSize: 16, color: "text.secondary", cursor: "pointer", mb: 0.25 }} />
								</Tooltip>
							</Stack>
							<Typography variant="body1" fontWeight={600} color="text.primary" sx={{ fontSize: "1.05rem", mt: 1 }}>
								{CANCELLATION_LABELS[policy.cancellationPolicy].label}
							</Typography>
							{policy.cancellationDescription && (
								<Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", mt: 0.5, lineHeight: 1.6 }}>
									{policy.cancellationDescription}
								</Typography>
							)}
						</Box>
						<Box>
							<Stack direction="row" alignItems="center" spacing={1}>
								<Typography sx={{ ...overlineSx, mb: 0 }}>PREPAYMENT</Typography>
								<Tooltip title={PREPAYMENT_LABELS[policy.prepaymentPolicy].tooltip} placement="top" arrow>
									<InfoOutlined sx={{ fontSize: 16, color: "text.secondary", cursor: "pointer", mb: 0.25 }} />
								</Tooltip>
							</Stack>
							<Typography variant="body1" fontWeight={600} color="text.primary" sx={{ fontSize: "1.05rem", mt: 1 }}>
								{PREPAYMENT_LABELS[policy.prepaymentPolicy].label}
							</Typography>
						</Box>
					</Stack>
				</Grid>
			</Grid>

			{/* Divider between Zone 1 and Zone 2 */}
			<Divider sx={{ my: 4.5, borderColor: "grey.100" }} />

			{/* ZONE 2: Property Rules */}
			<Box>
				<Typography variant="h6" fontWeight="700" mb={3}>
					Property Rules
				</Typography>
				<Stack direction="row" spacing={6} sx={{ flexWrap: "wrap", rowGap: 2 }}>
					<FlatHouseRule icon={Pets} label="Pets" allowed={!!policy.allowsPets} />
					<FlatHouseRule icon={SmokingRooms} label="Smoking" allowed={!!policy.allowsSmoking} />
					<FlatHouseRule icon={MusicNote} label="Parties" allowed={!!policy.allowsParties} />
				</Stack>
			</Box>

			{/* Divider between Zone 2 and Zone 3 (if footnote content exists) */}
			{(policy.quietHoursStart || policy.quietHoursEnd || policy.additionalRules) && (
				<>
					<Divider sx={{ my: 4.5, borderColor: "grey.100" }} />

					{/* ZONE 3: Footnotes */}
					<Box>
						<Grid container spacing={4}>
							{(policy.quietHoursStart || policy.quietHoursEnd) && (
								<Grid size={{ xs: 12, md: 4 }}>
									<Typography variant="subtitle2" fontWeight="700" color="text.primary" mb={1} sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
										Quiet Hours
									</Typography>
									<Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
										Please respect quiet hours between{" "}
										<Box component="span" sx={{ fontWeight: 600 }}>
											{policy.quietHoursStart}
										</Box>{" "}
										and{" "}
										<Box component="span" sx={{ fontWeight: 600 }}>
											{policy.quietHoursEnd}
										</Box>
										.
									</Typography>
								</Grid>
							)}

							<Grid size={{ xs: 12, md: policy.quietHoursStart || policy.quietHoursEnd ? 8 : 12 }}>
								<Typography variant="subtitle2" fontWeight="700" color="text.primary" mb={1} sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
									Important Notes
								</Typography>
								<Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
									{policy.additionalRules || "No additional rules specified. Please respect the property and its surroundings during your stay."}
								</Typography>
							</Grid>
						</Grid>
					</Box>
				</>
			)}
		</Paper>
	);
};
