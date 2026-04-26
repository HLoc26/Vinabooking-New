import { Box, Typography, FormHelperText } from "@mui/material";
import type { RoomForm } from "../../../types/owner.types";
import { CommonFields } from "./CommonFields";
import { StepperField } from "./StepperField";

interface Props {
	draft: RoomForm;
	set: <K extends keyof RoomForm>(field: K, value: RoomForm[K]) => void;
}

export default function AccommodationInfoField({ draft, set }: Props) {
	const viewDisabled = draft.viewType === "NONE";
	const sizeValue = draft.size ?? 0;
	const isSizeTooSmall = sizeValue > 0 && sizeValue < 5;

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
					<Box display="flex" justifyContent="flex-end" flexDirection="column" alignItems="flex-end">
						<StepperField label="Size (m²)" value={sizeValue} onChange={(v) => set("size", v || undefined)} allowDecimal />
						{isSizeTooSmall && (
							<FormHelperText error sx={{ mt: 0.5, textAlign: "right" }}>
								Minimum size is 5 m²
							</FormHelperText>
						)}
					</Box>
				</Box>

				<CommonFields draft={draft} set={set} viewDisabled={viewDisabled} />
			</Box>
		</Box>
	);
}
