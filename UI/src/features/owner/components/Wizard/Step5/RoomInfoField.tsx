import { Box, TextField, MenuItem, Typography } from "@mui/material";
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

			<Box display="flex" flexDirection="column" gap={2}>
				{/* Name (3/4) + Quantity (1/4) */}
				<Box display="flex" gap={2}>
					<TextField
						fullWidth
						required
						label="Room Name"
						value={draft.name}
						onChange={(e) => set("name", e.target.value)}
						error={!draft.name.trim()}
						helperText={!draft.name.trim() ? "Required" : ""}
						sx={{ flex: 3 }}
					/>
					<TextField label="Quantity" type="number" value={draft.quantity} onChange={(e) => set("quantity", Number(e.target.value))} inputProps={{ min: 1 }} sx={{ flex: 1 }} />
				</Box>

				{/* Adults / Children */}
				<Box display="flex" gap={2}>
					<TextField fullWidth label="Max Adults" type="number" value={draft.maxAdults} onChange={(e) => set("maxAdults", Number(e.target.value))} />
					<TextField fullWidth label="Max Children" type="number" value={draft.maxChildren} onChange={(e) => set("maxChildren", Number(e.target.value))} />
				</Box>

				{/* Bedrooms / Bathrooms */}
				<Box display="flex" gap={2}>
					<TextField fullWidth label="Bedrooms" type="number" value={draft.bedroomCount} onChange={(e) => set("bedroomCount", Number(e.target.value))} />
					<TextField fullWidth label="Bathrooms" type="number" value={draft.bathroomCount} onChange={(e) => set("bathroomCount", Number(e.target.value))} />
				</Box>

				{/* Size / View Type */}
				<Box display="flex" gap={2}>
					<TextField fullWidth label="Size (m²)" type="number" value={draft.size ?? ""} onChange={(e) => set("size", e.target.value ? Number(e.target.value) : undefined)} />
					<TextField fullWidth select label="View Type" value={draft.viewType} onChange={(e) => set("viewType", e.target.value)}>
						{VIEW_TYPES.map((t) => (
							<MenuItem key={t} value={t}>
								{t.replace(/_/g, " ")}
							</MenuItem>
						))}
					</TextField>
				</Box>

				{/* View Description (conditional full width) */}
				{draft.viewType !== "NONE" && <TextField fullWidth label="View Description" value={draft.viewDescription || ""} onChange={(e) => set("viewDescription", e.target.value)} />}

				{/* Price / Pricing Type */}
				<Box display="flex" gap={2}>
					<TextField fullWidth label="Price" type="number" value={draft.price ?? ""} onChange={(e) => set("price", e.target.value ? Number(e.target.value) : undefined)} />
					<TextField fullWidth select label="Pricing Type" value={draft.pricingType} onChange={(e) => set("pricingType", e.target.value)}>
						{PRICING_TYPES.map((t) => (
							<MenuItem key={t} value={t}>
								{t.replace(/_/g, " ")}
							</MenuItem>
						))}
					</TextField>
				</Box>

				{/* Description FULL WIDTH */}
				<TextField fullWidth label="Description" multiline minRows={3} value={draft.description || ""} onChange={(e) => set("description", e.target.value)} />
			</Box>
		</Box>
	);
}
