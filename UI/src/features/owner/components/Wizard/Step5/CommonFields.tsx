import * as React from "react";
import { Box, MenuItem, TextField, Typography, Alert, AlertTitle } from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";
import type { RoomForm } from "../../../types/owner.types";
import { PRICING_TYPES, VIEW_TYPES } from "../../../const/RoomConst";
import NumberField from "../../../../../components/shared/NumberField";

const MAX_PRICE = 100000000;

export function CommonFields({
	draft,
	set,
	viewDisabled,
	onValidationChange,
}: {
	draft: RoomForm;
	set: <K extends keyof RoomForm>(field: K, value: RoomForm[K]) => void;
	viewDisabled: boolean;
	onValidationChange?: (state: { disableSave: boolean; disableNext: boolean }) => void;
}) {
	const handleBasePriceChange = (val: number | null) => {
		const nextBase = Math.max(val ?? 0, 0);
		set("basePrice", nextBase);
		set("price", nextBase); // keep for compatibility
		
		// Ensure floor doesn't exceed new base
		if ((draft.floorPrice ?? 0) > nextBase) {
			set("floorPrice", nextBase);
		}
	};

	const handleFloorPriceChange = (val: number | null) => {
		const nextFloor = Math.max(val ?? 0, 0);
		const base = draft.basePrice ?? draft.price ?? 0;
		set("floorPrice", Math.min(nextFloor, base));
	};

	const basePrice = draft.basePrice ?? draft.price ?? 0;
	const floorPrice = draft.floorPrice ?? basePrice;

	const isPriceOverMax = basePrice > MAX_PRICE;
	const isPriceUnderMin = basePrice > 0 && basePrice < 1000;
	const isPriceZeroOrNeg = basePrice < 0;
	const isFloorInvalid = floorPrice > basePrice;
	const isInvalid = isPriceOverMax || isPriceUnderMin || isPriceZeroOrNeg || isFloorInvalid;

	const disableSave = isInvalid;
	const disableNext = isInvalid;

	React.useEffect(() => {
		onValidationChange?.({
			disableSave,
			disableNext,
		});
	}, [disableSave, disableNext, onValidationChange]);

	return (
		<Box display="flex" flexDirection="column" gap={4}>
			{/* Row 1: View */}
			<Box display="grid" gridTemplateColumns="1.2fr 1.8fr" gap={3}>
				<TextField select label="View Type" value={draft.viewType} onChange={(e) => set("viewType", e.target.value)} fullWidth>
					{VIEW_TYPES.map((t) => (
						<MenuItem key={t} value={t}>
							{t.replace(/_/g, " ")}
						</MenuItem>
					))}
				</TextField>

				<TextField
					label="View Description"
					multiline
					rows={1}
					value={draft.viewDescription ?? ""}
					onChange={(e) => set("viewDescription", e.target.value.slice(0, 100))}
					disabled={viewDisabled}
					fullWidth
				/>
			</Box>

			{/* Row 2: Pricing Logic */}
			<Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={3} alignItems="flex-start">
				<Box>
					<NumberField label="Base Price" suffix="VND" value={basePrice} onValueChange={handleBasePriceChange} max={MAX_PRICE} min={0} />
				</Box>
				<Box>
					<NumberField 
						label="Floor Price" 
						suffix="VND" 
						value={floorPrice} 
						onValueChange={handleFloorPriceChange} 
						max={basePrice} 
						min={0}
					/>
				</Box>
				<TextField
					select
					label="Pricing Type"
					value={draft.pricingType}
					onChange={(e) => set("pricingType", e.target.value)}
					fullWidth
					slotProps={{
						input: {
							sx: { height: 56 },
						},
					}}
				>
					{PRICING_TYPES.map((t) => (
						<MenuItem key={t} value={t}>
							{t.replace(/_/g, " ")}
						</MenuItem>
					))}
				</TextField>
			</Box>

			{/* Floor Price Info Alert */}
			<Alert 
				severity="info" 
				icon={<InfoOutlined fontSize="small" />}
				sx={{ 
					bgcolor: "rgba(2, 136, 209, 0.05)", 
					border: "1px solid rgba(2, 136, 209, 0.2)",
					"& .MuiAlert-message": { width: "100%" }
				}}
			>
				<AlertTitle sx={{ fontSize: "0.85rem", fontWeight: 700, mb: 0.5 }}>About Floor Price</AlertTitle>
				<Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.4 }}>
					The <strong>Floor Price</strong> acts as a safety net. Even if multiple discounts (like Early Bird + Long Stay) or custom multipliers apply, the system will <strong>never</strong> price this room below this amount. This ensures your margins are protected during peak promotion periods.
				</Typography>
			</Alert>

			{/* Row 3: Description */}
			<TextField
				fullWidth
				label="Description"
				multiline
				minRows={3}
				value={draft.description || ""}
				onChange={(e) => set("description", e.target.value.slice(0, 150))}
				helperText={`${(draft.description || "").length}/150`}
			/>
		</Box>
	);
}
