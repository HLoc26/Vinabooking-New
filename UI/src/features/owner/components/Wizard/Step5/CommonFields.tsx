import { Box, MenuItem, TextField } from "@mui/material";
import type { RoomForm } from "../../../types/owner.types";
import { PRICING_TYPES, VIEW_TYPES } from "../../../const/RoomConst";
import NumberField from "../../../../../components/shared/NumberField";

// ─── COMMON FIELDS ──────────────────────────────────────────────────────────
export function CommonFields({ draft, set, viewDisabled }: { draft: RoomForm; set: any; viewDisabled: boolean }) {
	return (
		<Box display="flex" flexDirection="column" gap={4}>
			{/* Hàng 1: View Type & Description */}
			<Box display="grid" gridTemplateColumns="1.2fr 1.8fr" gap={3}>
				<TextField select label="View Type" value={draft.viewType} onChange={(e) => set("viewType", e.target.value)}>
					{VIEW_TYPES.map((t) => (
						<MenuItem key={t} value={t}>
							{t.replace(/_/g, " ")}
						</MenuItem>
					))}
				</TextField>
				<TextField label="View Description" multiline rows={1} value={draft.viewDescription ?? ""} onChange={(e) => set("viewDescription", e.target.value)} disabled={viewDisabled} />
			</Box>

			{/* Hàng 2: Price & Pricing Type */}
			<Box display="grid" gridTemplateColumns="1fr 1fr" gap={3}>
				<NumberField
					label="Price"
					suffix="VND"
					value={draft.price}
					// Thay vì tự handle logic chuỗi, NumberField sẽ trả về giá trị số (Number)
					onValueChange={(val: number | null) => set("price", val ?? 0)}
					step={1000}
					// Tận dụng prop 'error' nếu có validation logic
					error={draft.price === 0}
				/>

				<TextField select label="Pricing Type" value={draft.pricingType} onChange={(e) => set("pricingType", e.target.value)}>
					{PRICING_TYPES.map((t) => (
						<MenuItem key={t} value={t}>
							{t.replace(/_/g, " ")}
						</MenuItem>
					))}
				</TextField>
			</Box>

			{/* Hàng 3: Description */}
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
