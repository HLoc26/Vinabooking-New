import { Grid, Box, TextField, Typography, Divider, Chip } from "@mui/material";
import { useCallback } from "react";
import debounce from "lodash.debounce";
import AddressInput from "./AddressInput";
import MapPicker from "./MapPicker";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const REQUIRED_FIELDS = ["street", "ward", "district", "city", "country"] as const;

export default function StepAddressBox({ form, setForm, onFieldChange }: any) {
	const { address } = form;

	const handleAddressChange = (data: any) => {
		setForm((prev: any) => ({
			...prev,
			address: { ...prev.address, ...data },
		}));
		onFieldChange?.();
	};

	const geocodeString = async (fullStr: string) => {
		if (fullStr.length < 5) return;
		try {
			const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullStr)}&format=json&limit=1`, {
				headers: { "User-Agent": "Vinabooking-App/1.0" },
			});
			const data = await res.json();
			if (data?.[0]) {
				handleAddressChange({
					latitude: parseFloat(data[0].lat),
					longitude: parseFloat(data[0].lon),
				});
			}
		} catch (err) {
			console.error("Nominatim sync failed", err);
		}
	};

	const debouncedSync = useCallback(
		debounce((str: string) => geocodeString(str), 1000),
		[]
	);

	const handleFieldUpdate = (field: string, value: string) => {
		const updated = { ...address, [field]: value };
		const newFullAddress = [updated.street, updated.ward, updated.district, updated.city, updated.country].filter(Boolean).join(", ");
		handleAddressChange({ ...updated, fullAddress: newFullAddress });
		debouncedSync(newFullAddress);
	};

	const allRequiredFilled = REQUIRED_FIELDS.every((f) => !!address[f]);
	const hasCoords = !!address.latitude && !!address.longitude;

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

			{/* Completion Status */}
			<Box display="flex" gap={1} flexWrap="wrap">
				<Chip
					size="small"
					icon={hasCoords ? <CheckCircleOutlineIcon /> : <ErrorOutlineIcon />}
					label={hasCoords ? "Map location set" : "Map location required"}
					color={hasCoords ? "success" : "default"}
					variant={hasCoords ? "filled" : "outlined"}
				/>
				<Chip
					size="small"
					icon={allRequiredFilled ? <CheckCircleOutlineIcon /> : <ErrorOutlineIcon />}
					label={allRequiredFilled ? "All fields filled" : "Fill in all address fields below"}
					color={allRequiredFilled ? "success" : "default"}
					variant={allRequiredFilled ? "filled" : "outlined"}
				/>
			</Box>

			<Divider />

			{/* Manual Fields */}
			<Grid container spacing={2}>
				<Grid item xs={12} sm={6}>
					<TextField
						fullWidth
						required
						label="Street / House Number"
						value={address.street || ""}
						onChange={(e) => handleFieldUpdate("street", e.target.value)}
						error={!address.street}
						helperText={!address.street ? "Required" : ""}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<TextField
						fullWidth
						required
						label="Ward / Suburb"
						value={address.ward || ""}
						onChange={(e) => handleFieldUpdate("ward", e.target.value)}
						error={!address.ward}
						helperText={!address.ward ? "Required" : ""}
					/>
				</Grid>
				<Grid item xs={12} sm={4}>
					<TextField
						fullWidth
						required
						label="District"
						value={address.district || ""}
						onChange={(e) => handleFieldUpdate("district", e.target.value)}
						error={!address.district}
						helperText={!address.district ? "Required" : ""}
					/>
				</Grid>
				<Grid item xs={12} sm={4}>
					<TextField
						fullWidth
						required
						label="City / Province"
						value={address.city || ""}
						onChange={(e) => handleFieldUpdate("city", e.target.value)}
						error={!address.city}
						helperText={!address.city ? "Required" : ""}
					/>
				</Grid>
				<Grid item xs={12} sm={4}>
					<TextField
						fullWidth
						required
						label="Country"
						value={address.country || ""}
						onChange={(e) => handleFieldUpdate("country", e.target.value)}
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
}
