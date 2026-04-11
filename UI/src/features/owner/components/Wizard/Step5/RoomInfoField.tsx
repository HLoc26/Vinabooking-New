import { Box, TextField, Typography } from "@mui/material";
import type { RoomForm } from "../../../types/owner.types";
import AccommodationInfoField from "./AccommodationInfoField";
import { CommonFields } from "./CommonFields";
import { StepperField } from "./StepperField";

interface Props {
	draft: RoomForm;
	set: (field: keyof RoomForm, value: any) => void;
	rentalType?: string;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function RoomInfoFields({ draft, set, rentalType }: Props) {
	if (rentalType === "ENTIRE_PLACE") return <AccommodationInfoField draft={draft} set={set} />;

	const isShared = rentalType === "SHARED_ROOM";
	const viewDisabled = draft.viewType === "NONE";

	return (
		<Box>
			<Typography variant="subtitle2" fontWeight={800} color="text.secondary" mb={2.5} sx={{ textTransform: "uppercase", letterSpacing: 1.5 }}>
				Room Info
			</Typography>

			<Box display="flex" flexDirection="column" gap={4}>
				<TextField fullWidth required label="Room Name" value={draft.name} onChange={(e) => set("name", e.target.value.slice(0, 50))} />

				<Box display="grid" gridTemplateColumns="1fr 1fr 1fr" alignItems="center">
					<Box display="flex" justifyContent="flex-start">
						<StepperField label="Quantity" value={draft.quantity} onChange={(v) => set("quantity", v)} min={1} />
					</Box>
					<Box display="flex" justifyContent="center">
						<StepperField label="Adults" value={draft.maxAdults} onChange={(v) => set("maxAdults", v)} min={1} />
					</Box>
					<Box display="flex" justifyContent="flex-end">
						<StepperField label="Children" value={draft.maxChildren} onChange={(v) => set("maxChildren", v)} min={0} />
					</Box>
				</Box>

				<Box display="grid" gridTemplateColumns="1fr 1fr 1fr" alignItems="center">
					{!isShared ? (
						<>
							<Box display="flex" justifyContent="flex-start">
								<StepperField label="Bedrooms" value={draft.bedroomCount} onChange={(v) => set("bedroomCount", v)} />
							</Box>
							<Box display="flex" justifyContent="center">
								<StepperField label="Baths" value={draft.bathroomCount} onChange={(v) => set("bathroomCount", v)} />
							</Box>
							<Box display="flex" justifyContent="flex-end">
								<StepperField label="Size (m²)" value={draft.size ?? 0} onChange={(v) => set("size", v || undefined)} allowDecimal />
							</Box>
						</>
					) : (
						<>
							<Box display="flex" justifyContent="flex-start">
								<StepperField label="Baths" value={draft.bathroomCount} onChange={(v) => set("bathroomCount", v)} />
							</Box>
							<Box display="flex" justifyContent="center">
								<StepperField label="Size (m²)" value={draft.size ?? 0} onChange={(v) => set("size", v || undefined)} allowDecimal />
							</Box>
							<Box display="flex" justifyContent="flex-end" />
						</>
					)}
				</Box>

				<CommonFields draft={draft} set={set} viewDisabled={viewDisabled} />
			</Box>
		</Box>
	);
}
