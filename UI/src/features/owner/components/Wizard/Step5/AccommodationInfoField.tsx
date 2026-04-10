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

			<Box display="flex" flexDirection="column" gap={4}>
				{/* Hàng 1: Max Adults/Children - Sử dụng Grid 3 cột để giữ alignment với hàng dưới */}
				<Box display="grid" gridTemplateColumns="1fr 1fr 1fr" alignItems="center">
					<Box display="flex" justifyContent="flex-start">
						<StepperField label="Adults" value={draft.maxAdults} onChange={(v) => set("maxAdults", v)} min={1} />
					</Box>
					<Box display="flex" justifyContent="center">
						<StepperField label="Children" value={draft.maxChildren} onChange={(v) => set("maxChildren", v)} min={0} />
					</Box>
					{/* Cột thứ 3 để trống để "Adults" nằm trái, "Children" nằm giữa giống SHARED_ROOM */}
					<Box display="flex" justifyContent="flex-end" />
				</Box>

				{/* Hàng 2: Grid 3 cột đầy đủ: Bedrooms, Bathrooms, Size */}
				<Box display="grid" gridTemplateColumns="1fr 1fr 1fr" alignItems="center">
					<Box display="flex" justifyContent="flex-start">
						<StepperField label="Bedrooms" value={draft.bedroomCount} onChange={(v) => set("bedroomCount", v)} />
					</Box>
					<Box display="flex" justifyContent="center">
						<StepperField label="Bathrooms" value={draft.bathroomCount} onChange={(v) => set("bathroomCount", v)} />
					</Box>
					<Box display="flex" justifyContent="flex-end">
						<StepperField label="Size (m²)" value={draft.size ?? 0} onChange={(v) => set("size", v || undefined)} allowDecimal />
					</Box>
				</Box>

				<CommonFields draft={draft} set={set} viewDisabled={viewDisabled} />
			</Box>
		</Box>
	);
}
