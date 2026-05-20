import { useState, useEffect, useCallback } from "react";
import { Box, Grid, TextField, Typography, Chip, CircularProgress, InputAdornment, Paper, Button, Divider } from "@mui/material";
import { CheckCircleOutline, ErrorOutline, Public, LocationOn, EditOutlined, Close, Check, MapOutlined, SignpostOutlined, LocationCityOutlined, PlaceOutlined } from "@mui/icons-material";
import { useQueryClient } from "@tanstack/react-query";

import MapPicker from "../../Wizard/Step3/MapPicker";
import CountryComboBox from "../../Wizard/Step3/CountryComboBox";
import CityComboBox from "../../Wizard/Step3/CityComBoBox";

import { useUpdateAddress } from "../../../hooks/useUpdateAddress";
import { usePushNotificationContext } from "../../../../../context/PushNotification/hook";
import useModalContext from "../../../../../context/ModalContext/hook";

import type { AddressForm, UpdateAddressPayload } from "../../../types/owner.types";
import { FieldLabel, FieldValue, editFieldSx, getCardSx, getHeaderSx } from "../shared/CardSharedUI";

interface Props {
	accommodationId: string;
	initialAddress: AddressForm | null;
}

// =========================================================================
// 1. PURE FUNCTIONS & HELPERS
// =========================================================================
const checkCoords = (addr: Partial<AddressForm>) => addr.latitude != null && addr.longitude != null;
const checkRequiredFields = (addr: Partial<AddressForm>) => !!addr.street && !!addr.city && !!addr.country;

async function reverseGeocodeExtra(lat: number, lng: number) {
	const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&layer=address`, { headers: { "User-Agent": "Vinabooking-App/1.0" } });
	if (!res.ok) throw new Error("Reverse geocode failed");
	const data = await res.json();
	return { postalCode: data.address?.postcode ?? "", placeId: data.place_id ? String(data.place_id) : "" };
}

const getExtraLocationData = async (lat?: number | null, lng?: number | null, currentPostal = "", currentPlaceId = "") => {
	let postalCode = currentPostal;
	let placeId = currentPlaceId;

	if (lat != null && lng != null) {
		try {
			const extra = await reverseGeocodeExtra(lat, lng);
			postalCode = extra.postalCode;
			placeId = extra.placeId;
		} catch (err) {
			console.error("Reverse geocode failed:", err);
		}
	}
	return { postalCode, placeId };
};

// =========================================================================
// 2. SUB-COMPONENTS
// =========================================================================
const SaveConfirmModal = ({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) => (
	<Box sx={{ p: 3, maxWidth: 400 }}>
		<Typography variant="h6" fontWeight={700} mb={1}>
			Save Location?
		</Typography>
		<Typography variant="body2" color="text.secondary" mb={3}>
			Are you sure you want to update the accommodation's address and map location?
		</Typography>
		<Box display="flex" justifyContent="flex-end" gap={1.5}>
			<Button variant="text" color="inherit" onClick={onCancel} sx={{ fontWeight: 600 }}>
				Cancel
			</Button>
			<Button variant="contained" color="primary" onClick={onConfirm} sx={{ fontWeight: 600 }}>
				Confirm Save
			</Button>
		</Box>
	</Box>
);

const DiscardConfirmModal = ({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) => (
	<Box sx={{ p: 3, maxWidth: 400 }}>
		<Typography variant="h6" fontWeight={700} mb={1}>
			Discard Changes?
		</Typography>
		<Typography variant="body2" color="text.secondary" mb={3}>
			You have unsaved changes to your address. Are you sure you want to discard them?
		</Typography>
		<Box display="flex" justifyContent="flex-end" gap={1.5}>
			<Button variant="text" color="inherit" onClick={onCancel} sx={{ fontWeight: 600 }}>
				Keep Editing
			</Button>
			<Button variant="contained" color="error" onClick={onConfirm} sx={{ fontWeight: 600 }}>
				Discard
			</Button>
		</Box>
	</Box>
);

const AddressViewContent = ({ address }: { address: AddressForm | null }) => (
	<Grid container rowSpacing={3} columnSpacing={4}>
		<Grid size={{ xs: 12, md: 6 }}>
			<FieldLabel icon={<Public fontSize="small" />}>Country / Region</FieldLabel>
			<FieldValue>{address?.country || "Not set"}</FieldValue>
		</Grid>
		<Grid size={{ xs: 12, md: 6 }}>
			<FieldLabel icon={<LocationCityOutlined fontSize="small" />}>City / Province</FieldLabel>
			<FieldValue>{address?.city || "Not set"}</FieldValue>
		</Grid>

		<Grid size={{ xs: 12, md: 6 }}>
			<FieldLabel icon={<SignpostOutlined fontSize="small" />}>Street / House Number</FieldLabel>
			<FieldValue>{address?.street || "Not set"}</FieldValue>
		</Grid>
		<Grid size={{ xs: 12, md: 6 }}>
			<FieldLabel icon={<PlaceOutlined fontSize="small" />}>Full Address</FieldLabel>
			<FieldValue>{address?.fullAddress || "Not set"}</FieldValue>
		</Grid>

		<Grid size={{ xs: 12 }}>
			<Divider sx={{ borderColor: "rgba(255,255,255,0.06)", my: 1 }} />
			<Box sx={{ mt: 1, borderRadius: "12px", overflow: "hidden" }}>
				<MapPicker lat={address?.latitude ?? null} lng={address?.longitude ?? null} onChange={() => {}} readOnly />
			</Box>
		</Grid>
	</Grid>
);

const AddressEditContent = ({
	address,
	update,
	hasCoords,
	hasRequiredFields,
}: {
	address: Partial<AddressForm>;
	update: (data: Partial<AddressForm>) => void;
	hasCoords: boolean;
	hasRequiredFields: boolean;
}) => (
	<Box display="flex" flexDirection="column" gap={2.5}>
		<Box display="flex" gap={1} flexWrap="wrap" alignItems="center" mb={1}>
			<Chip
				size="small"
				icon={hasCoords ? <CheckCircleOutline /> : <LocationOn />}
				label={hasCoords ? "Pin set" : "Pin not set"}
				color={hasCoords ? "success" : "default"}
				sx={{ borderRadius: "8px", fontWeight: 600 }}
			/>
			<Chip
				size="small"
				icon={hasRequiredFields ? <CheckCircleOutline /> : <ErrorOutline />}
				label={hasRequiredFields ? "Fields complete" : "Fill required fields"}
				color={hasRequiredFields ? "success" : "default"}
				sx={{ borderRadius: "8px", fontWeight: 600 }}
			/>
		</Box>
		<Grid container spacing={2}>
			<Grid size={{ xs: 12, sm: 6 }}>
				<CountryComboBox value={address.country ?? ""} onChange={(c, code) => update({ country: c, countryCode: code, city: "" })} />
			</Grid>
			<Grid size={{ xs: 12, sm: 6 }}>
				<CityComboBox label="City / Province" value={address.city ?? ""} countryCode={address.countryCode ?? ""} onChange={(city) => update({ city })} disabled={!address.country} />
			</Grid>
			<Grid size={{ xs: 12, sm: 6 }}>
				<TextField fullWidth size="small" sx={editFieldSx} label="Street / House Number" value={address.street ?? ""} onChange={(e) => update({ street: e.target.value })} />
			</Grid>
			<Grid size={{ xs: 12 }}>
				<TextField
					fullWidth
					size="small"
					sx={editFieldSx}
					label="Full Address"
					value={address.fullAddress ?? ""}
					onChange={(e) => update({ fullAddress: e.target.value })}
					multiline
					minRows={1}
					slotProps={{
						input: {
							startAdornment: (
								<InputAdornment position="start" sx={{ alignSelf: "center" }}>
									<Public fontSize="small" sx={{ color: "text.secondary" }} />
								</InputAdornment>
							),
						},
					}}
				/>
			</Grid>
		</Grid>
		<Box mt={1}>
			<Typography variant="body2" color="text.secondary" mb={1.5} fontWeight={500}>
				Click anywhere on the map to drop a pin.
			</Typography>
			<MapPicker lat={address.latitude ?? null} lng={address.longitude ?? null} onChange={(data) => update(data)} />
		</Box>
	</Box>
);

// =========================================================================
// 3. MAIN COMPONENT
// =========================================================================
export const ManageAddressCard = ({ accommodationId, initialAddress }: Props) => {
	const queryClient = useQueryClient();
	const { pushNotification } = usePushNotificationContext();
	const { openModal, closeModal } = useModalContext();
	const { mutate, isPending } = useUpdateAddress(accommodationId);

	const [isEditing, setIsEditing] = useState(false);
	const [address, setAddress] = useState<Partial<AddressForm>>(initialAddress || {});
	const [isDirty, setIsDirty] = useState(false);

	useEffect(() => {
		setAddress(initialAddress || {});
		setIsDirty(false);
	}, [initialAddress]);

	const update = useCallback((data: Partial<AddressForm>) => {
		setAddress((prev) => ({ ...prev, ...data }));
		setIsDirty(true);
	}, []);

	const executeSave = async () => {
		const { postalCode, placeId } = await getExtraLocationData(address.latitude, address.longitude, address.postalCode, address.placeId);
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
				pushNotification("Address updated successfully!", "success");
				setIsDirty(false);
				setIsEditing(false);
				queryClient.invalidateQueries({ queryKey: ["accommodationManage", accommodationId] });
			},
			onError: () => pushNotification("Failed to update address.", "error"),
		});
	};

	const handleCancel = () => {
		if (!isDirty) return setIsEditing(false);
		openModal(
			<DiscardConfirmModal
				onCancel={closeModal}
				onConfirm={() => {
					setAddress(initialAddress || {});
					setIsDirty(false);
					setIsEditing(false);
					closeModal();
				}}
			/>
		);
	};

	const hasCoords = checkCoords(address);
	const hasRequiredFields = checkRequiredFields(address);
	const canSave = isDirty && hasRequiredFields && hasCoords && !isPending;

	return (
		<Paper elevation={0} sx={getCardSx(isEditing)}>
			<Box sx={getHeaderSx(isEditing)}>
				<Box display="flex" alignItems="center" gap={1.5}>
					<Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
						<MapOutlined sx={{ fontSize: "1.1rem", color: "text.secondary" }} />
					</Box>
					<Box>
						<Typography variant="subtitle1" fontWeight={700} lineHeight={1.2} sx={{ fontSize: "0.95rem" }}>
							Location & Address
						</Typography>
						<Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.75rem" }}>
							Manage your accommodation address and map pin
						</Typography>
					</Box>
				</Box>

				{isEditing ? (
					<Box display="flex" gap={1} alignItems="center">
						<Button
							variant="text"
							size="small"
							color="inherit"
							startIcon={<Close sx={{ fontSize: "0.9rem !important" }} />}
							onClick={handleCancel}
							disabled={isPending}
							sx={{
								borderRadius: "10px",
								fontWeight: 600,
								textTransform: "none",
								fontSize: "0.8rem",
								color: "text.secondary",
								px: 1.5,
								"&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
							}}
						>
							Cancel
						</Button>
						<Button
							variant="contained"
							size="small"
							color="primary"
							startIcon={isPending ? <CircularProgress size={13} color="inherit" /> : <Check sx={{ fontSize: "0.9rem !important" }} />}
							disabled={!canSave}
							onClick={() =>
								openModal(
									<SaveConfirmModal
										onCancel={closeModal}
										onConfirm={() => {
											closeModal();
											executeSave();
										}}
									/>
								)
							}
							sx={{ borderRadius: "10px", fontWeight: 700, textTransform: "none", fontSize: "0.8rem", px: 2, boxShadow: "none", "&:hover": { boxShadow: "none" } }}
						>
							Save changes
						</Button>
					</Box>
				) : (
					<Button
						variant="outlined"
						size="small"
						color="inherit"
						startIcon={<EditOutlined sx={{ fontSize: "0.9rem !important" }} />}
						onClick={() => setIsEditing(true)}
						sx={{
							borderRadius: "10px",
							fontWeight: 600,
							textTransform: "none",
							fontSize: "0.8rem",
							px: 1.75,
							borderColor: "rgba(255,255,255,0.15)",
							color: "text.secondary",
							"&:hover": { borderColor: "rgba(255,255,255,0.4)", bgcolor: "rgba(255,255,255,0.05)", color: "text.primary" },
						}}
					>
						Edit
					</Button>
				)}
			</Box>

			<Box sx={{ px: 3.5, py: 3 }}>
				{isEditing ? <AddressEditContent address={address} update={update} hasCoords={hasCoords} hasRequiredFields={hasRequiredFields} /> : <AddressViewContent address={initialAddress} />}
			</Box>
		</Paper>
	);
};
