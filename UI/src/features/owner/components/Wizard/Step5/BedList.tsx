import { Box, Typography, Button, Paper, Stack, Grid, TextField, MenuItem, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { BedForm } from "../../../types/owner.types";
import { BED_TYPES, BED_SIZES } from "../../../const/RoomConst";

interface Props {
	beds: BedForm[];
	onAdd: () => void;
	onRemove: (id: string) => void;
	onUpdate: (id: string, field: keyof BedForm, value: BedForm) => void;
}

export default function BedList({ beds, onAdd, onRemove, onUpdate }: Props) {
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
				{beds.map((bed) => (
					<Paper key={bed.id} elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
						<Grid container spacing={1.5} alignItems="flex-start">
							<Grid item xs={12} sm={4}>
								<TextField fullWidth size="small" label="Bed Name" value={bed.name} onChange={(e) => onUpdate(bed.id, "name", e.target.value)} placeholder="e.g. Master Bed" />
							</Grid>
							<Grid item xs={6} sm={3}>
								<TextField fullWidth size="small" select label="Type" value={bed.bedType} onChange={(e) => onUpdate(bed.id, "bedType", e.target.value)}>
									{BED_TYPES.map((t) => (
										<MenuItem key={t} value={t}>
											{t.replace(/_/g, " ")}
										</MenuItem>
									))}
								</TextField>
							</Grid>
							<Grid item xs={6} sm={3}>
								<TextField fullWidth size="small" select label="Size" value={bed.size || ""} onChange={(e) => onUpdate(bed.id, "size", e.target.value)}>
									<MenuItem value="">—</MenuItem>
									{BED_SIZES.map((s) => (
										<MenuItem key={s} value={s}>
											{s}
										</MenuItem>
									))}
								</TextField>
							</Grid>
							<Grid item xs={10} sm={1}>
								<TextField
									fullWidth
									size="small"
									type="number"
									label="Price"
									value={bed.price ?? ""}
									onChange={(e) => onUpdate(bed.id, "price", e.target.value ? Number(e.target.value) : undefined)}
								/>
							</Grid>
							<Grid item xs={2} sm={1} display="flex" justifyContent="flex-end">
								<IconButton size="small" color="error" onClick={() => onRemove(bed.id)}>
									<DeleteOutlineIcon fontSize="small" />
								</IconButton>
							</Grid>
						</Grid>
					</Paper>
				))}
			</Stack>
		</Box>
	);
}
