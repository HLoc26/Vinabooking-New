import { Box, Typography } from "@mui/material";
import type { RoomForm } from "../../../types/owner.types";
import { StepperField, CommonFields } from "./RoomInfoField";

interface Props {
	draft: RoomForm;
	set: (field: keyof RoomForm, value: any) => void;
}

export default function AccommodationInfoField({ draft, set }: Props) {
	const viewDisabled = draft.viewType === "NONE";

	return (
		<Box>
			<Typography variant="subtitle2" fontWeight={800} color="text.secondary" mb={2.5} sx={{ textTransform: "uppercase", letterSpacing: 1.5 }}>
				Accommodation Info
			</Typography>

			<Box display="flex" flexDirection="column" gap={5}>
				{/* Max Adults/Children căn giữa, khoảng cách xa nhau */}
				<Box display="flex" justifyContent="center" gap={12} py={1}>
					<StepperField label="Max Adults" value={draft.maxAdults} onChange={(v) => set("maxAdults", v)} min={1} />
					<StepperField label="Max Children" value={draft.maxChildren} onChange={(v) => set("maxChildren", v)} min={0} />
				</Box>

				{/* Grid 3 cột: Bedrooms, Bathrooms, Size */}
				<Box display="grid" gridTemplateColumns="repeat(3, auto)" justifyContent="center" gap={10}>
					<StepperField label="Bedrooms" value={draft.bedroomCount} onChange={(v) => set("bedroomCount", v)} />
					<StepperField label="Bathrooms" value={draft.bathroomCount} onChange={(v) => set("bathroomCount", v)} />
					<StepperField label="Size (m²)" value={draft.size ?? 0} onChange={(v) => set("size", v || undefined)} allowDecimal />
				</Box>

				<CommonFields draft={draft} set={set} viewDisabled={viewDisabled} />
			</Box>
		</Box>
	);
}
