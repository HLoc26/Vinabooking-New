import { useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Box, Grid, TextField, Typography, Divider, Chip, CircularProgress } from "@mui/material";
import debounce from "lodash.debounce";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import AddressInput from "./AddressInput";
import MapPicker from "./MapPicker";
import { useUpdateAddress } from "../../../hooks/useUpdateAddress";
import type { WizardForm, UpdateAddressPayload, AddressForm } from "../../../types/owner.types";

interface Props {
	form: WizardForm;
	setForm: React.Dispatch<React.SetStateAction<WizardForm>>;
	onFieldChange?: () => void;
	triggerSubmit: boolean;
	resetTrigger: () => void;
	onSuccess: () => void;
}

const StepAddressBox = ({ form, setForm, onFieldChange, triggerSubmit, resetTrigger, onSuccess }: Props) => {
	const { address, accommodationId } = form;
	const { mutate } = useUpdateAddress(accommodationId ?? "");

	const {
		reset,
		setValue,
		getValues,
		formState: { isDirty },
	} = useForm<AddressForm>({
		defaultValues: address,
	});

	// ── Load from cache ──────────────────────────────────────────────────────
	const { data: cachedAddress, isLoading: isFetching } = useQuery<UpdateAddressPayload>({
		queryKey: ["accommodation", accommodationId, "address"],
		queryFn: () => Promise.reject("Cache only"),
		enabled: !!accommodationId,
		staleTime: 5 * 60 * 1000,
		retry: false,
	});

	useEffect(() => {
		// Chỉ reset khi có data cache và form chưa bị sửa đổi
		if (cachedAddress && !isDirty) {
			reset(cachedAddress);
		}
	}, [cachedAddress, isDirty, reset]);

	// ── Geocoding (Search String -> Coords) ──────────────────────────────────
	const geocodeString = async (fullStr: string) => {
		if (fullStr.length < 5) return;
		try {
			const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullStr)}&format=json&limit=1`, { headers: { "User-Agent": "Vinabooking-App/1.0" } });
			const data = await res.json();
			if (data?.[0]) {
				const lat = parseFloat(data[0].lat);
				const lng = parseFloat(data[0].lon);
				setValue("latitude", lat);
				setValue("longitude", lng);
				setForm((prev) => ({ ...prev, address: { ...prev.address, latitude: lat, longitude: lng } }));
			}
		} catch (err) {
			console.error("Geocode failed:", err);
		}
	};

	const debouncedSearch = useCallback(
		debounce((str: string) => geocodeString(str), 1000),
		[]
	);

	// ── Handlers ─────────────────────────────────────────────────────────────

	// Khi thay đổi từ Search Bar hoặc Click Map (Vì MapPicker của bạn trả về full object address)
	const handleAddressChange = (data: Partial<AddressForm>) => {
		const current = getValues();
		const merged = { ...current, ...data };

		reset(merged, { keepDirty: true });
		setForm((prev) => ({ ...prev, address: merged }));

		// Nếu thay đổi từ Search bar (có fullAddress nhưng không có lat/lng mới trigger search)
		if (data.fullAddress && !data.latitude) {
			debouncedSearch(data.fullAddress);
		}
		onFieldChange?.();
	};

	const handleFieldUpdate = (field: keyof AddressForm, value: string) => {
		setValue(field, value, { shouldDirty: true });

		const current = getValues();
		const updatedFields = { ...current, [field]: value };
		const newFullAddress = [updatedFields.street, updatedFields.ward, updatedFields.district, updatedFields.city, updatedFields.country].filter(Boolean).join(", ");

		setValue("fullAddress", newFullAddress, { shouldDirty: true });
		setForm((prev) => ({
			...prev,
			address: { ...updatedFields, fullAddress: newFullAddress },
		}));
	};

	// ── Submit ───────────────────────────────────────────────────────────────
	useEffect(() => {
		if (!triggerSubmit) return;

		if (!isDirty && accommodationId) {
			resetTrigger();
			onSuccess();
			return;
		}

		mutate(getValues(), {
			onSuccess: () => {
				reset(getValues());
				onSuccess();
			},
			onSettled: resetTrigger,
		});
	}, [triggerSubmit]);

	if (isFetching)
		return (
			<Box display="flex" justifyContent="center" py={6}>
				<CircularProgress size={32} />
			</Box>
		);

	return (
		<Box display="flex" flexDirection="column" gap={3}>
			<Box>
				<Typography variant="h6" fontWeight={700}>
					Location
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Search for your address or click directly on the map.
				</Typography>
			</Box>
			<AddressInput address={address} onChange={handleAddressChange} />
			<Box display="flex" gap={1}>
				<Chip
					size="small"
					icon={address.latitude ? <CheckCircleOutlineIcon /> : <ErrorOutlineIcon />}
					label={address.latitude ? "Map location set" : "Map location required"}
					color={address.latitude ? "success" : "default"}
				/>
			</Box>
			<Divider />
			<Grid container spacing={2}>
				<Grid size={{ xs: 12, sm: 6 }}>
					<TextField
						fullWidth
						label="Street"
						value={address.street || ""}
						onChange={(e) => handleFieldUpdate("street", e.target.value)}
						// Ép label shrink để không bị đè khi dữ liệu từ map đổ vào
						slotProps={{ inputLabel: { shrink: !!address.street } }}
					/>
				</Grid>

				<Grid size={{ xs: 12, sm: 6 }}>
					<TextField
						fullWidth
						label="Ward (Phường/Xã)"
						value={address.ward || ""}
						onChange={(e) => handleFieldUpdate("ward", e.target.value)}
						slotProps={{ inputLabel: { shrink: !!address.ward } }}
					/>
				</Grid>

				<Grid size={{ xs: 12, sm: 4 }}>
					<TextField
						fullWidth
						label="District (Quận/Huyện)"
						// Dùng city_district từ JSON nếu district trống
						value={address.district || ""}
						onChange={(e) => handleFieldUpdate("district", e.target.value)}
						error={!address.district} // Validation trực tiếp
						helperText={!address.district ? "Vui lòng chọn hoặc nhập Quận" : ""}
						slotProps={{ inputLabel: { shrink: !!address.district } }}
					/>
				</Grid>

				<Grid size={{ xs: 12, sm: 4 }}>
					<TextField fullWidth label="City" value={address.city || ""} onChange={(e) => handleFieldUpdate("city", e.target.value)} slotProps={{ inputLabel: { shrink: !!address.city } }} />
				</Grid>

				<Grid size={{ xs: 12, sm: 4 }}>
					<TextField
						fullWidth
						label="Country"
						value={address.country || ""}
						onChange={(e) => handleFieldUpdate("country", e.target.value)}
						slotProps={{ inputLabel: { shrink: !!address.country } }}
					/>
				</Grid>
			</Grid>
			<MapPicker lat={address.latitude} lng={address.longitude} onChange={handleAddressChange} />
		</Box>
	);
};

export default StepAddressBox;
