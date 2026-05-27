import { useState, useEffect } from "react";
import { Box, Paper, Typography, Button, CircularProgress } from "@mui/material";
import { MeetingRoomOutlined, Check } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import { useQueryClient } from "@tanstack/react-query";

import { usePushNotificationContext } from "../../../../../context/PushNotification/hook";
import StepRoomsBox from "../../Wizard/Step5/StepRoomBox";

import { getCardSx, getHeaderSx } from "../shared/CardSharedUI";

import type { WizardForm, RoomForm, AmenityConfigForm, BedForm, RoomSummary, BedSummary, AmenitySummaryEntry, AddressForm } from "../../../types/owner.types";
import { ERentalType, EAccommodationType, EFacilityType, type EAmenityType } from "../../../../accommodation/types/accommodation.types";
import type { AccommodationHydrateResponse } from "../../../services/ownerApi";

type Props = Readonly<{
	accommodationId: string;
	accommodationData: AccommodationHydrateResponse;
}>;

type RawFacility = Readonly<{
	id: string;
	name: string;
	fee: number;
	note?: string | null;
}>;

const hydrateRoomsToForm = (apiRooms: RoomSummary[]): RoomForm[] => {
	return apiRooms.map(
		(r): RoomForm => ({
			tempId: r.id,
			id: r.id,
			name: r.name,
			description: r.description || "",
			quantity: r.quantity,
			maxAdults: r.maxAdults,
			maxChildren: r.maxChildren,
			size: r.size || undefined,
			bedroomCount: r.bedroomCount,
			bathroomCount: r.bathroomCount,
			viewType: r.viewType,
			viewDescription: r.viewDescription || "",
			basePrice: r.basePrice ? Number(r.basePrice) : undefined,
			floorPrice: r.floorPrice ? Number(r.floorPrice) : undefined,
			price: r.price ? Number(r.price) : undefined,
			pricingType: r.pricingType,
			beds: r.beds.map(
				(b: BedSummary): BedForm => ({
					id: b.id,
					name: b.name || "",
					description: b.description || "",
					bedType: b.bedType,
					size: b.size || "",
					price: b.price ? Number(b.price) : undefined,
					quantity: 1,
				})
			),
			amenities: r.amenities.map(
				(a: AmenitySummaryEntry): AmenityConfigForm => ({
					id: a.id,
					name: a.name,
					type: a.type as EAmenityType,
				})
			),
		})
	);
};

const emptyAddress: AddressForm = { fullAddress: "", street: "", city: "", country: "", latitude: null, longitude: null, countryCode: "", postalCode: "", placeId: "" };

export const ManageRoomsCard = ({ accommodationId, accommodationData }: Props) => {
	const queryClient = useQueryClient();
	const { pushNotification } = usePushNotificationContext();

	const [wizardForm, setWizardForm] = useState<WizardForm>(() => {
		const initialRooms = accommodationData.rooms ? hydrateRoomsToForm(accommodationData.rooms) : [];
		return {
			accommodationId: accommodationId,
			rentalType: accommodationData.rentalType,
			accommodationType: (accommodationData.type as EAccommodationType) || EAccommodationType.HOTEL,
			name: accommodationData.name,
			description: accommodationData.description || "",
			address: accommodationData.address || emptyAddress,
			facilities: accommodationData.facilities.map((f: RawFacility) => ({ id: f.id, name: f.name, fee: f.fee, note: f.note || null, type: EFacilityType.OTHER, description: "" })),
			rooms: initialRooms,
			images: [],
		};
	});

	useEffect(() => {
		if (accommodationData.rooms) {
			setWizardForm((prev) => ({ ...prev, rooms: hydrateRoomsToForm(accommodationData.rooms) }));
		}
	}, [accommodationData.rooms]);

	const [triggerSave, setTriggerSave] = useState(false);
	const isEntirePlace = accommodationData.rentalType === ERentalType.ENTIRE_PLACE;

	return (
		<Paper elevation={0} sx={getCardSx(false)}>
			<StepRoomsBox
				form={wizardForm}
				setForm={setWizardForm}
				triggerSave={triggerSave}
				isManageMode={true}
				renderHeader={(onAddRoom) => (
					<Box sx={getHeaderSx(false)}>
						<Box display="flex" alignItems="center" gap={1.5}>
							<Box
								sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
							>
								<MeetingRoomOutlined sx={{ fontSize: "1.1rem", color: "text.secondary" }} />
							</Box>
							<Box>
								<Typography variant="subtitle1" fontWeight={700} lineHeight={1.2} sx={{ fontSize: "0.95rem" }}>
									{isEntirePlace ? "Accommodation Details" : "Rooms Management"}
								</Typography>
								<Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.75rem" }}>
									{isEntirePlace ? "Configure details for your entire property" : "Add and configure rooms for this accommodation"}
								</Typography>
							</Box>
						</Box>

						<Box display="flex" gap={1} alignItems="center">
							{isEntirePlace && (
								<Button
									variant="contained"
									size="small"
									color="primary"
									onClick={() => setTriggerSave(true)}
									disabled={triggerSave}
									startIcon={triggerSave ? <CircularProgress size={13} color="inherit" /> : <Check sx={{ fontSize: "0.9rem !important" }} />}
									sx={{ borderRadius: "10px", fontWeight: 700, textTransform: "none", fontSize: "0.8rem", px: 2, boxShadow: "none", "&:hover": { boxShadow: "none" } }}
								>
									Save changes
								</Button>
							)}

							{!isEntirePlace && wizardForm.rooms.length > 0 && (
								<Button
									variant="outlined"
									size="small"
									color="inherit"
									startIcon={<AddIcon sx={{ fontSize: "0.9rem !important" }} />}
									onClick={onAddRoom}
									sx={{
										borderRadius: "10px",
										fontWeight: 600,
										textTransform: "none",
										fontSize: "0.8rem",
										px: 1.75,
										borderColor: "rgba(255,255,255,0.15)",
										color: "text.secondary",
										"&:hover": { borderColor: "primary.main", bgcolor: "rgba(var(--mui-palette-primary-mainChannel) / 0.1)", color: "primary.main" },
									}}
								>
									Add Room
								</Button>
							)}
						</Box>
					</Box>
				)}
				onSaveComplete={() => {
					setTriggerSave(false);
					pushNotification("Room updated successfully!", "success");
					queryClient.invalidateQueries({ queryKey: ["accommodationManage", accommodationId] });
				}}
				onSaveFailed={() => setTriggerSave(false)}
			/>
		</Paper>
	);
};
