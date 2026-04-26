import { Box, Typography, Button, Paper, Stack, TextField, MenuItem, IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import type { BedForm } from "../../../types/owner.types";
import { BED_TYPES, BED_SIZES } from "../../../const/RoomConst";
import NumberField from "../../../../../components/shared/NumberField";

interface Props {
	beds: BedForm[];
	onAdd: () => void;
	onRemove: (id: string) => void;
	onUpdate: <K extends keyof BedForm>(id: string, field: K, value: BedForm[K]) => void;
	rentalType?: string;
}

const MAX_BED_PRICE = 100000000;

export default function BedList({ beds, onAdd, onRemove, onUpdate, rentalType }: Props) {
	// Only SHARED_ROOM gets bed-level pricing
	const showBedPrice = rentalType === "SHARED_ROOM";
	const showQuantity = rentalType === "SHARED_ROOM" || rentalType === "PRIVATE_ROOM";

	// Validation helper
	const validateQuantity = (val: string | number): number => {
		const num = Number(val);
		return isNaN(num) || num < 1 ? 1 : num;
	};

	return (
		<Box>
			<Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
				<Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
					Beds
				</Typography>
				<Button size="small" startIcon={<AddIcon />} onClick={onAdd} variant="outlined" sx={{ borderRadius: 2 }}>
					Add Bed
				</Button>
			</Box>

			{beds.length === 0 && (
				<Typography variant="body2" color="text.disabled" sx={{ textAlign: "center", py: 2 }}>
					No beds added yet. Click "Add Bed" to get started.
				</Typography>
			)}

			<Stack spacing={2}>
				{beds.map((bed) => {
					const isBunk = bed.bedType === "BUNK_BED";
					const quantity = bed.quantity ?? 1;
					const price = bed.price ?? undefined;

					return (
						<Paper key={bed.id} elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
							<Box display="flex" gap={1.5} alignItems="center" flexWrap="nowrap">
								{/* Bed Name */}
								<Box sx={{ flex: "2 1 130px", minWidth: 0 }}>
									<TextField
										fullWidth
										size="small"
										label="Bed Name"
										value={bed.name || ""}
										onChange={(e) => onUpdate(bed.id, "name", e.target.value.slice(0, 50))}
										placeholder="e.g. Master Bed"
									/>
								</Box>

								{/* Type */}
								<Box sx={{ flex: "2 1 120px", minWidth: 0 }}>
									<TextField fullWidth size="small" select label="Type" value={bed.bedType || ""} onChange={(e) => onUpdate(bed.id, "bedType", e.target.value)}>
										{BED_TYPES.map((t) => (
											<MenuItem key={t} value={t}>
												{t.replace(/_/g, " ")}
											</MenuItem>
										))}
									</TextField>
								</Box>

								{/* Size */}
								<Box sx={{ flex: "1 1 90px", minWidth: 0 }}>
									<TextField fullWidth size="small" select label="Size" value={bed.size || ""} onChange={(e) => onUpdate(bed.id, "size", e.target.value)}>
										{BED_SIZES.map((s) => (
											<MenuItem key={s} value={s}>
												{s}
											</MenuItem>
										))}
									</TextField>
								</Box>

								{/* Quantity — SHARED_ROOM and PRIVATE_ROOM only */}
								{showQuantity && (
									<Box sx={{ flex: "1 1 90px", minWidth: 0 }}>
										<TextField
											fullWidth
											size="small"
											type="number"
											label={
												isBunk ? (
													<Box display="flex" alignItems="center" gap={0.5}>
														Qty
														<Tooltip title="Bunk beds count ×2 actual slots (e.g. 2 bunks = 4 sleeping spots)" placement="top">
															<InfoOutlinedIcon sx={{ fontSize: 14, color: "info.main", cursor: "help" }} />
														</Tooltip>
													</Box>
												) : (
													"Qty"
												)
											}
											value={quantity}
											onChange={(e) => {
												const validated = validateQuantity(e.target.value);
												onUpdate(bed.id, "quantity", validated);
											}}
											slotProps={{
												htmlInput: { min: 1 },
											}}
										/>
									</Box>
								)}

								{/* Price — SHARED_ROOM only */}
								{showBedPrice && (
									<Box sx={{ flex: "1 1 160px", minWidth: 0 }}>
										<NumberField
											label="Price"
											suffix="VND"
											size="small"
											value={price ?? 0}
											onValueChange={(val: number | null) => {
												const finalVal = val === null || val === undefined ? undefined : Math.min(MAX_BED_PRICE, Math.max(0, val));
												onUpdate(bed.id, "price", finalVal === 0 ? undefined : finalVal);
											}}
											max={MAX_BED_PRICE}
										/>
									</Box>
								)}

								{/* Delete */}
								<IconButton size="small" color="error" onClick={() => onRemove(bed.id)} sx={{ flexShrink: 0 }}>
									<DeleteOutlineIcon fontSize="small" />
								</IconButton>
							</Box>
						</Paper>
					);
				})}
			</Stack>
		</Box>
	);
}
