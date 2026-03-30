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

// ── Reverse geocode lat/lng → countryCode, postalCode, placeId ────────────────
async function reverseGeocode(lat: number, lng: number) {
	const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&layer=address`, { headers: { "User-Agent": "Vinabooking-App/1.0" } });
	if (!res.ok) throw new Error(`Nominatim reverse geocode failed: ${res.status}`);
	const data = await res.json();
	const addr = data.address || {};
	return {
		countryCode: (addr.country_code || "").toUpperCase() as string,
		postalCode: (addr.postcode || "") as string,
		placeId: data.place_id ? String(data.place_id) : "",
	};
}

const StepAddressBox = ({ form, setForm, onFieldChange, triggerSubmit, resetTrigger, onSuccess }: Props) => {
	const { address, accommodationId } = form;
	const { mutate, isPending } = useUpdateAddress(accommodationId ?? "");

	// ── RHF ──────────────────────────────────────────────────────────────────
	const {
		watch,
		reset,
		setValue,
		formState: { isDirty },
	} = useForm<AddressForm>({
		defaultValues: address,
	});

	// Mirror RHF watched values up to parent form state
	const watched = watch();
	useEffect(() => {
		setForm((prev) => ({ ...prev, address: { ...prev.address, ...watched } }));
	}, [JSON.stringify(watched)]);

	// ── Load from cache on back-navigation ───────────────────────────────────
	const { data: cachedAddress, isLoading: isFetching } = useQuery<UpdateAddressPayload>({
		queryKey: ["accommodation", accommodationId, "address"],
		queryFn: () => Promise.reject("Cache only"), // never actually fetches — populated by setQueryData
		enabled: !!accommodationId,
		staleTime: 5 * 60 * 1000,
		retry: false,
	});

	useEffect(() => {
		if (cachedAddress) {
			reset(cachedAddress);
		}
	}, [cachedAddress]);

	// ── Submit when parent triggers ───────────────────────────────────────────
	useEffect(() => {
		if (!triggerSubmit) return;

		// No changes → skip API, just advance
		if (!isDirty && accommodationId) {
			resetTrigger();
			onSuccess();
			return;
		}

		const run = async () => {
			// Step 1: reverse geocode to get countryCode, postalCode, placeId
			let countryCode = "";
			let postalCode = "";
			let placeId = "";

			if (address.latitude && address.longitude) {
				try {
					const geo = await reverseGeocode(address.latitude, address.longitude);
					countryCode = geo.countryCode;
					postalCode = geo.postalCode;
					placeId = geo.placeId;
				} catch (err) {
					console.error("Reverse geocode on submit failed:", err);
				}
			}

			// Step 2: build payload matching UpdateAddressDTO
			const payload: UpdateAddressPayload = {
				fullAddress: address.fullAddress,
				street: address.street,
				ward: address.ward,
				district: address.district,
				city: address.city,
				country: address.country,
				countryCode,
				postalCode,
				placeId,
				latitude: address.latitude,
				longitude: address.longitude,
			};

			// Step 3: PUT → setQueryData in hook onSuccess → advance
			mutate(payload, {
				onSuccess: () => {
					reset(payload); // mark form as clean after save
					onSuccess();
				},
				onSettled: resetTrigger,
			});
		};

		run();
	}, [triggerSubmit]);

	// ── Address change helpers ────────────────────────────────────────────────
	const handleAddressChange = (data: Partial<WizardForm["address"]>) => {
		const merged = { ...address, ...data };
		setForm((prev) => ({ ...prev, address: merged }));
		reset(merged, { keepDirty: true }); // keep isDirty tracking accurate
		onFieldChange?.();
	};

	const geocodeString = async (fullStr: string) => {
		if (fullStr.length < 5) return;
		try {
			const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullStr)}&format=json&limit=1`, { headers: { "User-Agent": "Vinabooking-App/1.0" } });
			const data = await res.json();
			if (data?.[0]) {
				handleAddressChange({
					latitude: parseFloat(data[0].lat),
					longitude: parseFloat(data[0].lon),
				});
			}
		} catch (err) {
			console.error("Nominatim forward geocode failed:", err);
		}
	};

	const debouncedSync = useCallback(
		debounce((str: string) => geocodeString(str), 1000),
		[]
	);

	const handleFieldUpdate = (field: keyof AddressForm, value: string) => {
		// 1. Cập nhật trực tiếp vào RHF (điều này trigger re-render và update 'watched')
		setValue(field, value, { shouldDirty: true, shouldValidate: true });

		// 2. Tính toán fullAddress dựa trên các giá trị mới nhất
		const currentValues = { ...watch(), [field]: value };
		const newFullAddress = [currentValues.street, currentValues.ward, currentValues.district, currentValues.city, currentValues.country].filter(Boolean).join(", ");

		setValue("fullAddress", newFullAddress, { shouldDirty: true });

		// 3. Debounce geocode
		debouncedSync(newFullAddress);
	};

	// ── Derived state ─────────────────────────────────────────────────────────
	const hasCoords = !!address.latitude && !!address.longitude;
	const hasRequiredFields = !!(address.street && address.district && address.city && address.country);

	// ── Loading state (cache hydration) ──────────────────────────────────────
	if (isFetching) {
		return (
			<Box display="flex" justifyContent="center" py={6}>
				<CircularProgress size={32} />
			</Box>
		);
	}

	// ── UI ────────────────────────────────────────────────────────────────────
	return (
		<Box display="flex" flexDirection="column" gap={3}>
			<Box>
				<Typography variant="h6" fontWeight={700} mb={0.5}>
					Location
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Search for your address or click directly on the map to set your location.
				</Typography>
			</Box>

			{/* Search Input */}
			<AddressInput address={address} onChange={handleAddressChange} />

			{/* Status chips */}
			<Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
				<Chip
					size="small"
					icon={hasCoords ? <CheckCircleOutlineIcon /> : <ErrorOutlineIcon />}
					label={hasCoords ? "Map location set" : "Map location required"}
					color={hasCoords ? "success" : "default"}
					variant={hasCoords ? "filled" : "outlined"}
				/>
				<Chip
					size="small"
					icon={hasRequiredFields ? <CheckCircleOutlineIcon /> : <ErrorOutlineIcon />}
					label={hasRequiredFields ? "All fields filled" : "Fill in all address fields below"}
					color={hasRequiredFields ? "success" : "default"}
					variant={hasRequiredFields ? "filled" : "outlined"}
				/>
				{isPending && <CircularProgress size={18} sx={{ ml: 1 }} />}
			</Box>

			<Divider />

			{/* Manual Fields */}
			<Grid container spacing={2}>
				<Grid size={{ xs: 12, sm: 6 }}>
					<TextField
						fullWidth
						required
						label="Street / House Number"
						value={address.street || ""}
						onChange={(e) => handleFieldUpdate("street", e.target.value)}
						disabled={isPending}
						error={!address.street}
						helperText={!address.street ? "Required" : ""}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6 }}>
					<TextField fullWidth label="Ward / Suburb" value={address.ward || ""} onChange={(e) => handleFieldUpdate("ward", e.target.value)} disabled={isPending} />
				</Grid>
				<Grid size={{ xs: 12, sm: 4 }}>
					<TextField
						fullWidth
						required
						label="District"
						value={address.district || ""}
						onChange={(e) => handleFieldUpdate("district", e.target.value)}
						disabled={isPending}
						error={!address.district}
						helperText={!address.district ? "Required" : ""}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 4 }}>
					<TextField
						fullWidth
						required
						label="City / Province"
						value={address.city || ""}
						onChange={(e) => handleFieldUpdate("city", e.target.value)}
						disabled={isPending}
						error={!address.city}
						helperText={!address.city ? "Required" : ""}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 4 }}>
					<TextField
						fullWidth
						required
						label="Country"
						value={address.country || ""}
						onChange={(e) => handleFieldUpdate("country", e.target.value)}
						disabled={isPending}
						error={!address.country}
						helperText={!address.country ? "Required" : ""}
					/>
				</Grid>
			</Grid>

			{/* Map */}
			<Box>
				<Typography variant="body2" color="text.secondary" mb={1}>
					Click on the map to pin your exact location
				</Typography>
				<MapPicker lat={address.latitude} lng={address.longitude} onChange={handleAddressChange} />
			</Box>
		</Box>
	);
};

export default StepAddressBox;
