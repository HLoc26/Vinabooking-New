import { Box, InputAdornment, MenuItem, TextField, Typography } from "@mui/material";
import type { RoomForm } from "../../../types/owner.types";
import { PRICING_TYPES, VIEW_TYPES } from "../../../const/RoomConst";

// ─── COMMON FIELDS ──────────────────────────────────────────────────────────
export function CommonFields({ draft, set, viewDisabled }: { draft: RoomForm; set: any; viewDisabled: boolean }) {
	// Helper: 1000 -> 1.000
	const formatNumber = (val: number) => {
		if (!val) return "0";
		return val.toLocaleString("vi-VN");
	};

	const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		// Chỉ lấy các chữ số từ input (loại bỏ dấu chấm và ký tự lạ)
		const rawValue = e.target.value.replace(/\D/g, "");

		// Chuyển về số nguyên để lưu vào state
		const numValue = parseInt(rawValue, 10);
		set("price", isNaN(numValue) ? 0 : numValue);
	};

	const stepPrice = (delta: number) => {
		const current = draft.price || 0;
		const next = Math.max(0, current + delta);
		set("price", next);
	};

	const stepperBtnSx = {
		border: "none",
		background: "none",
		cursor: "pointer",
		px: 0.5,
		lineHeight: 1,
		color: "text.secondary",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		"&:hover": { color: "primary.main", bgcolor: "action.hover" },
		transition: "all 0.2s",
	};

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
				<TextField
					label="Price"
					// Hiển thị dạng text đã format dấu chấm
					value={formatNumber(draft.price || 0)}
					onChange={handlePriceChange}
					onWheel={(e) => {
						// Chỉ tăng giảm khi ô input đang được focus
						if (document.activeElement === e.target) {
							e.preventDefault();
							const delta = e.deltaY < 0 ? 1000 : -1000;
							stepPrice(delta);
						}
					}}
					slotProps={{
						input: {
							endAdornment: (
								<InputAdornment position="end">
									<Typography variant="caption" fontWeight={700} sx={{ mr: 1, color: "text.disabled" }}>
										VND
									</Typography>
									<Box display="flex" flexDirection="column" sx={{ borderLeft: "1px solid", borderColor: "divider", ml: 1 }}>
										<Box component="button" type="button" onClick={() => stepPrice(1000)} sx={stepperBtnSx}>
											▴
										</Box>
										<Box component="button" type="button" onClick={() => stepPrice(-1000)} sx={stepperBtnSx}>
											▾
										</Box>
									</Box>
								</InputAdornment>
							),
							sx: { fontWeight: 700 },
						},
					}}
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
