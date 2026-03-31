import { useEffect, useState } from "react";
import { Box, Grid, TextField, Typography, Divider, Chip, CircularProgress } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import AddressInput from "./AddressInput";
import MapPicker from "./MapPicker";
import { useUpdateAddress } from "../../../hooks/useUpdateAddress";

import type { WizardForm, UpdateAddressPayload } from "../../../types/owner.types";

interface Props {
	form: WizardForm;
	setForm: React.Dispatch<React.SetStateAction<WizardForm>>;
	onFieldChange?: () => void;
	triggerSubmit: boolean;
	resetTrigger: () => void;
	onSuccess: () => void;
}

// ── Reverse geocode helper ───────────────────────────────────────────────
async function reverseGeocode(lat: number, lng: number) {
	const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&layer=address`, { headers: { "User-Agent": "Vinabooking-App/1.0" } });

	if (!res.ok) throw new Error("Reverse geocode failed");

	const data = await res.json();
	const addr = data.address || {};

	return {
		countryCode: (addr.country_code || "").toUpperCase(),
		postalCode: addr.postcode || "",
		placeId: data.place_id ? String(data.place_id) : "",
	};
}

const StepAddressBox = ({ form, setForm, onFieldChange, triggerSubmit, resetTrigger, onSuccess }: Props) => {
	const { address, accommodationId } = form;
	const { mutate, isPending } = useUpdateAddress(accommodationId ?? "");

	const [hasChanged, setHasChanged] = useState(false);

	// ── Handle address change (search + map) ───────────────────────────────
	const handleAddressChange = (data: Partial<WizardForm["address"]>) => {
		const merged = { ...address, ...data };

		setForm((prev) => ({
			...prev,
			address: merged,
		}));

		setHasChanged(true);
		onFieldChange?.();
	};

	// ── Manual field update (NO AUTO GEOCODE) ──────────────────────────────
	const handleFieldUpdate = (field: keyof WizardForm["address"], value: string) => {
		const updated = {
			...address,
			[field]: value,
		};

		const newFullAddress = [updated.street, updated.ward, updated.district, updated.city, updated.country].filter(Boolean).join(", ");

		setForm((prev) => ({
			...prev,
			address: {
				...updated,
				fullAddress: newFullAddress,
			},
		}));

		setHasChanged(true);
		onFieldChange?.();
	};

	// ── Submit logic ───────────────────────────────────────────────────────
	useEffect(() => {
		if (!triggerSubmit) return;

		const run = async () => {
			// ✅ skip ONLY if nothing changed
			if (!hasChanged && accommodationId) {
				resetTrigger();
				onSuccess();
				return;
			}

			let countryCode = "";
			let postalCode = "";
			let placeId = "";

			if (address.latitude != null && address.longitude != null) {
				try {
					const geo = await reverseGeocode(address.latitude, address.longitude);
					countryCode = geo.countryCode;
					postalCode = geo.postalCode;
					placeId = geo.placeId;
				} catch (err) {
					console.error("Reverse geocode failed:", err);
				}
			}

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

			mutate(payload, {
				onSuccess: () => {
					setHasChanged(false); // reset dirty state
					onSuccess();
				},
				onSettled: resetTrigger,
			});
		};

		run();
	}, [triggerSubmit]);

	// ── Derived state ──────────────────────────────────────────────────────
	const hasCoords = address.latitude != null && address.longitude != null;
	const hasRequiredFields = !!address.street && !!address.district && !!address.city && !!address.country;

	// ── UI ────────────────────────────────────────────────────────────────
	return (
		<Box display="flex" flexDirection="column" gap={3}>
			<Box>
				<Typography variant="h6" fontWeight={700}>
					Location
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Search for your address or click on the map.
				</Typography>
			</Box>

			{/* Search */}
			<AddressInput address={address} onChange={handleAddressChange} />

			{/* Status */}
			<Box display="flex" gap={1} flexWrap="wrap">
				<Chip
					size="small"
					icon={hasCoords ? <CheckCircleOutlineIcon /> : <ErrorOutlineIcon />}
					label={hasCoords ? "Map location set" : "Map location required"}
					color={hasCoords ? "success" : "default"}
				/>

				<Chip
					size="small"
					icon={hasRequiredFields ? <CheckCircleOutlineIcon /> : <ErrorOutlineIcon />}
					label={hasRequiredFields ? "Fields complete" : "Fill required fields"}
					color={hasRequiredFields ? "success" : "default"}
				/>

				{isPending && <CircularProgress size={18} />}
			</Box>

			<Divider />

			{/* Manual fields */}
			<Grid container spacing={2}>
				<Grid size={{ xs: 12, sm: 6 }}>
					<TextField fullWidth label="Street" value={address.street || ""} onChange={(e) => handleFieldUpdate("street", e.target.value)} />
				</Grid>

				<Grid size={{ xs: 12, sm: 6 }}>
					<TextField fullWidth label="Ward" value={address.ward || ""} onChange={(e) => handleFieldUpdate("ward", e.target.value)} />
				</Grid>

				<Grid size={{ xs: 12, sm: 4 }}>
					<TextField fullWidth label="District" value={address.district || ""} onChange={(e) => handleFieldUpdate("district", e.target.value)} />
				</Grid>

				<Grid size={{ xs: 12, sm: 4 }}>
					<TextField fullWidth label="City" value={address.city || ""} onChange={(e) => handleFieldUpdate("city", e.target.value)} />
				</Grid>

				<Grid size={{ xs: 12, sm: 4 }}>
					<TextField fullWidth label="Country" value={address.country || ""} onChange={(e) => handleFieldUpdate("country", e.target.value)} />
				</Grid>
			</Grid>

			{/* Map */}
			<Box>
				<Typography variant="body2" mb={1}>
					Click map to set exact location
				</Typography>

				<MapPicker lat={address.latitude} lng={address.longitude} onChange={handleAddressChange} />
			</Box>
		</Box>
	);
};

export default StepAddressBox;
