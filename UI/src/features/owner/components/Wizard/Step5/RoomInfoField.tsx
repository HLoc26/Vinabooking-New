import { Box, Grid, TextField, MenuItem, Typography } from "@mui/material";
import type { RoomForm } from "../../../types/owner.types";
import { VIEW_TYPES, PRICING_TYPES } from "../../../const/RoomConst";

interface Props {
	draft: RoomForm;
	set: (field: keyof RoomForm, value: any) => void;
}

export default function RoomInfoFields({ draft, set }: Props) {
	return (
		<Box>
			<Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={1.5} sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
				Room Info
			</Typography>

			<Grid container spacing={2}>
				{/* Name + Quantity */}
				<Grid item xs={12} sm={8}>
					<TextField
						fullWidth
						required
						label="Room Name"
						value={draft.name}
						onChange={(e) => set("name", e.target.value)}
						error={!draft.name.trim()}
						helperText={!draft.name.trim() ? "Required" : ""}
					/>
				</Grid>
				<Grid item xs={12} sm={4}>
					<TextField fullWidth type="number" label="Quantity" value={draft.quantity} onChange={(e) => set("quantity", Number(e.target.value))} inputProps={{ min: 1 }} />
				</Grid>

				{/* Description */}
				<Grid item xs={12}>
					<TextField fullWidth multiline rows={2} label="Description (optional)" value={draft.description || ""} onChange={(e) => set("description", e.target.value)} />
				</Grid>

				{/* Guests */}
				<Grid item xs={6} sm={3}>
					<TextField fullWidth type="number" label="Max Adults" value={draft.maxAdults} onChange={(e) => set("maxAdults", Number(e.target.value))} inputProps={{ min: 1 }} />
				</Grid>
				<Grid item xs={6} sm={3}>
					<TextField fullWidth type="number" label="Max Children" value={draft.maxChildren} onChange={(e) => set("maxChildren", Number(e.target.value))} inputProps={{ min: 0 }} />
				</Grid>

				{/* Rooms */}
				<Grid item xs={6} sm={3}>
					<TextField fullWidth type="number" label="Bedrooms" value={draft.bedroomCount} onChange={(e) => set("bedroomCount", Number(e.target.value))} inputProps={{ min: 0 }} />
				</Grid>
				<Grid item xs={6} sm={3}>
					<TextField fullWidth type="number" label="Bathrooms" value={draft.bathroomCount} onChange={(e) => set("bathroomCount", Number(e.target.value))} inputProps={{ min: 0 }} />
				</Grid>

				{/* Size + Price + Pricing */}
				<Grid item xs={6} sm={4}>
					<TextField fullWidth type="number" label="Size (m²)" value={draft.size ?? ""} onChange={(e) => set("size", e.target.value ? Number(e.target.value) : undefined)} />
				</Grid>
				<Grid item xs={6} sm={4}>
					<TextField fullWidth type="number" label="Price" value={draft.price ?? ""} onChange={(e) => set("price", e.target.value ? Number(e.target.value) : undefined)} />
				</Grid>
				<Grid item xs={12} sm={4}>
					<TextField fullWidth select label="Pricing Type" value={draft.pricingType} onChange={(e) => set("pricingType", e.target.value)}>
						{PRICING_TYPES.map((t) => (
							<MenuItem key={t} value={t}>
								{t.replace(/_/g, " ")}
							</MenuItem>
						))}
					</TextField>
				</Grid>

				{/* View */}
				<Grid item xs={12} sm={draft.viewType !== "NONE" ? 6 : 12}>
					<TextField fullWidth select label="View Type" value={draft.viewType} onChange={(e) => set("viewType", e.target.value)}>
						{VIEW_TYPES.map((t) => (
							<MenuItem key={t} value={t}>
								{t.replace(/_/g, " ")}
							</MenuItem>
						))}
					</TextField>
				</Grid>
				{draft.viewType !== "NONE" && (
					<Grid item xs={12} sm={6}>
						<TextField fullWidth label="View Description" value={draft.viewDescription || ""} onChange={(e) => set("viewDescription", e.target.value)} />
					</Grid>
				)}
			</Grid>
		</Box>
	);
}
