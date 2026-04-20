import * as React from "react";
import { Box, MenuItem, TextField, FormHelperText } from "@mui/material";
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
	set: any;
	viewDisabled: boolean;
	onValidationChange?: (state: { disableSave: boolean; disableNext: boolean }) => void;
}) {
	const handlePriceChange = (val: number | null) => {
		set("price", val ?? 0); // ✅ no clamp
	};

	const priceValue = draft.price ?? 0;

	const isPriceOverMax = priceValue > MAX_PRICE;
	const isPriceUnderMin = priceValue > 0 && priceValue < 1000;
	const isPriceZeroOrNeg = priceValue < 0;
	const isInvalid = isPriceOverMax || isPriceUnderMin || isPriceZeroOrNeg;

	const disableSave = isInvalid;
	const disableNext = isInvalid;

	// 🔥 push state up
	React.useEffect(() => {
		onValidationChange?.({
			disableSave,
			disableNext,
		});
	}, [disableSave, disableNext, onValidationChange]);

	return (
		<Box display="flex" flexDirection="column" gap={4}>
			{/* Row 1 */}
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

			{/* Row 2 */}
			<Box display="grid" gridTemplateColumns="1fr 1fr" gap={3} alignItems="flex-start">
				<Box>
					<NumberField label="Price" suffix="VND" value={priceValue} onValueChange={handlePriceChange} max={MAX_PRICE} />

					{isPriceOverMax && <FormHelperText error>Price cannot exceed 100,000,000 VND</FormHelperText>}
					{isPriceUnderMin && <FormHelperText error>Price must be at least 1,000 VND</FormHelperText>}
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

			{/* Row 3 */}
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
