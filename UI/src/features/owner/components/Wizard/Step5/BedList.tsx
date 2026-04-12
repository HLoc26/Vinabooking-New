import { Box, Typography, Button, Paper, Stack, TextField, MenuItem, IconButton, InputAdornment, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import type { BedForm } from "../../../types/owner.types";
import { BED_TYPES, BED_SIZES } from "../../../const/RoomConst";

interface Props {
	beds: BedForm[];
	onAdd: () => void;
	onRemove: (id: string) => void;
	onUpdate: (id: string, field: keyof BedForm, value: any) => void;
	rentalType?: string;
}

export default function BedList({ beds, onAdd, onRemove, onUpdate, rentalType }: Props) {
	const showBedPrice = rentalType === "SHARED_ROOM" || rentalType === "PRIVATE_ROOM";
	const showQuantity = rentalType === "SHARED_ROOM" || rentalType === "PRIVATE_ROOM";

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

					return (
						<Paper key={bed.id} elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
							<Box display="flex" gap={1.5} alignItems="center" flexWrap="nowrap">
								{/* Bed Name */}
								<Box sx={{ flex: "2 1 130px", minWidth: 0 }}>
									<TextField fullWidth size="small" label="Bed Name" value={bed.name} onChange={(e) => onUpdate(bed.id, "name", e.target.value)} placeholder="e.g. Master Bed" />
								</Box>

								{/* Type */}
								<Box sx={{ flex: "2 1 120px", minWidth: 0 }}>
									<TextField fullWidth size="small" select label="Type" value={bed.bedType} onChange={(e) => onUpdate(bed.id, "bedType", e.target.value)}>
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
										<MenuItem value="">—</MenuItem>
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
											value={bed.quantity ?? 1}
											onChange={(e) => onUpdate(bed.id, "quantity", Math.max(1, Number(e.target.value)))}
											inputProps={{ min: 1 }}
										/>
									</Box>
								)}

								{/* Price — SHARED_ROOM and PRIVATE_ROOM only */}
								{showBedPrice && (
									<Box sx={{ flex: "1 1 110px", minWidth: 0 }}>
										<TextField
											fullWidth
											size="small"
											type="number"
											label="Price"
											value={bed.price ?? ""}
											onChange={(e) => onUpdate(bed.id, "price", e.target.value ? Math.max(0, Number(e.target.value)) : undefined)}
											inputProps={{ min: 0 }}
											InputProps={{ endAdornment: <InputAdornment position="end">VND</InputAdornment> }}
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
