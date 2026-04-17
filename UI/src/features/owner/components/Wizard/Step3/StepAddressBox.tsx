import { useEffect, useState } from "react";
import { Box, Grid, TextField, Typography, Divider, Chip, CircularProgress, InputAdornment } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import PublicIcon from "@mui/icons-material/Public";
import LocationOnIcon from "@mui/icons-material/LocationOn";

import MapPicker from "./MapPicker";
import CountryComboBox from "./CountryComboBox";
import CityComboBox from "./CityComBoBox";

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

async function reverseGeocodeExtra(lat: number, lng: number) {
	const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&layer=address`, { headers: { "User-Agent": "Vinabooking-App/1.0" } });
	if (!res.ok) throw new Error("Reverse geocode failed");
	const data = await res.json();
	const addr = data.address || {};
	return {
		postalCode: addr.postcode ?? "",
		placeId: data.place_id ? String(data.place_id) : "",
	};
}

const StepAddressBox = ({ form, setForm, onFieldChange, triggerSubmit, resetTrigger, onSuccess }: Props) => {
	const { address, accommodationId } = form;
	const { mutate, isPending } = useUpdateAddress(accommodationId ?? "");
	const [hasChanged, setHasChanged] = useState(false);

	const update = (data: Partial<WizardForm["address"]>) => {
		setForm((prev) => ({
			...prev,
			address: { ...prev.address, ...data },
		}));
		setHasChanged(true);
		onFieldChange?.();
	};

	const handleCountryChange = (country: string, countryCode: string) => {
		update({ country, countryCode, city: "" });
	};

	const handleMapChange = (data: Partial<WizardForm["address"]>) => {
		update(data);
	};

	useEffect(() => {
		if (!triggerSubmit) return;

		const run = async () => {
			if (!hasChanged && accommodationId) {
				resetTrigger();
				onSuccess();
				return;
			}

			let postalCode = address.postalCode ?? "";
			let placeId = address.placeId ?? "";

			if (address.latitude != null && address.longitude != null) {
				try {
					const extra = await reverseGeocodeExtra(address.latitude, address.longitude);
					postalCode = extra.postalCode;
					placeId = extra.placeId;
				} catch (err) {
					console.error("Reverse geocode failed:", err);
				}
			}

			const payload: UpdateAddressPayload = {
				fullAddress: address.fullAddress ?? "",
				street: address.street ?? "",
				city: address.city ?? "",
				country: address.country ?? "",
				countryCode: address.countryCode ?? "",
				postalCode,
				placeId,
				latitude: address.latitude ?? null,
				longitude: address.longitude ?? null,
			};

			mutate(payload, {
				onSuccess: () => {
					setHasChanged(false);
					onSuccess();
				},
				onSettled: resetTrigger,
			});
		};

		run();
	}, [triggerSubmit]);

	const hasCoords = address.latitude != null && address.longitude != null;
	const hasRequiredFields = !!address.street && !!address.city && !!address.country;

	return (
		<Box display="flex" flexDirection="column" gap={3}>
			<Box>
				<Typography variant="h6" fontWeight={700}>
					Property Location
				</Typography>
				<Typography variant="body2" color="text.secondary" mt={0.5}>
					Fill in the address details and pin the exact location on the map. Clicking the map will auto-fill Country and City.
				</Typography>
			</Box>

			<Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
				<Chip size="small" icon={hasCoords ? <CheckCircleOutlineIcon /> : <LocationOnIcon />} label={hasCoords ? "Pin set" : "Pin not set"} color={hasCoords ? "success" : "default"} />
				<Chip
					size="small"
					icon={hasRequiredFields ? <CheckCircleOutlineIcon /> : <ErrorOutlineIcon />}
					label={hasRequiredFields ? "Fields complete" : "Fill required fields"}
					color={hasRequiredFields ? "success" : "default"}
				/>
				{isPending && <CircularProgress size={16} sx={{ ml: 0.5 }} />}
			</Box>

			<Divider />

			<Grid container spacing={2}>
				<Grid size={{ xs: 12, sm: 6 }}>
					<CountryComboBox value={address.country ?? ""} onChange={handleCountryChange} />
				</Grid>

				<Grid size={{ xs: 12, sm: 6 }}>
					<CityComboBox
						label="City / Province"
						value={address.city ?? ""}
						country={address.country ?? ""}
						countryCode={address.countryCode ?? ""}
						onChange={(city) => update({ city })}
						disabled={!address.country}
					/>
				</Grid>

				<Grid size={{ xs: 12, sm: 6 }}>
					<TextField
						fullWidth
						label="Street / House Number"
						placeholder="e.g. 123 Nguyen Hue"
						value={address.street ?? ""}
						onChange={(e) => update({ street: e.target.value })}
						slotProps={{
							htmlInput: { maxLength: 255 },
						}}
					/>
				</Grid>

				<Grid size={{ xs: 12 }}>
					<TextField
						fullWidth
						label="Full Address"
						placeholder="e.g. 123 Nguyen Hue, Ben Nghe Ward, District 1, Ho Chi Minh City"
						value={address.fullAddress ?? ""}
						onChange={(e) => update({ fullAddress: e.target.value })}
						multiline
						minRows={1}
						slotProps={{
							htmlInput: { maxLength: 500 },
							input: {
								startAdornment: (
									<InputAdornment position="start" sx={{ alignSelf: "center" }}>
										<PublicIcon fontSize="small" sx={{ color: "text.secondary" }} />
									</InputAdornment>
								),
							},
						}}
					/>
				</Grid>
			</Grid>

			<Box>
				<Typography variant="body2" color="text.secondary" mb={1}>
					Click anywhere on the map to drop a pin — Country and City will be filled automatically.
				</Typography>
				<MapPicker lat={address.latitude ?? null} lng={address.longitude ?? null} onChange={handleMapChange} />
			</Box>
		</Box>
	);
};

export default StepAddressBox;
