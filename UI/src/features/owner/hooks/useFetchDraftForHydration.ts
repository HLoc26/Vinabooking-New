import { useQuery } from "@tanstack/react-query";
import { getAccommodationDraftDetail } from "../services/ownerApi";
import { EAccommodationType, EAmenityType, ERentalType } from "../../accommodation/types/accommodation.types";
import type { FacilityConfig } from "../types/owner.types";

export const useFetchDraftForHydration = (draftId?: string) => {
	return useQuery({
		queryKey: ["draftAccommodation", draftId],
		queryFn: () => {
			if (!draftId) throw new Error("Missing draft ID");
			return getAccommodationDraftDetail(draftId);
		},
		enabled: !!draftId,
		retry: 1,
		select: (draftData) => {
			const mappedAddress = draftData.address
				? {
						fullAddress: draftData.address.fullAddress,
						street: draftData.address.street,
						city: draftData.address.city,
						country: draftData.address.country,
						latitude: draftData.address.latitude ? Number(draftData.address.latitude) : null,
						longitude: draftData.address.longitude ? Number(draftData.address.longitude) : null,
						countryCode: draftData.address.countryCode,
						postalCode: draftData.address.postalCode || "",
						placeId: draftData.address.placeId || "",
					}
				: { fullAddress: "", street: "", city: "", country: "", latitude: null, longitude: null, countryCode: "", postalCode: "", placeId: "" };

			const mappedRooms =
				draftData.rooms?.map((room) => ({
					id: room.id,
					tempId: room.id,
					name: room.name,
					description: room.description || "",
					quantity: room.quantity,
					maxAdults: room.maxAdults,
					maxChildren: room.maxChildren,
					size: room.size ? Number(room.size) : undefined,
					bedroomCount: room.bedroomCount,
					bathroomCount: room.bathroomCount,
					viewType: room.viewType,
					viewDescription: room.viewDescription || "",
					price: room.price ? Number(room.price) : undefined,
					pricingType: room.pricingType,
					beds: room.beds.map((bed) => ({
						id: bed.id,
						name: bed.name || "",
						bedType: bed.bedType,
						size: bed.size || undefined,
						price: bed.price ? Number(bed.price) : undefined,
					})),
					amenities: room.amenities.map((a) => ({
						id: a.id,
						name: a.name,
						type: a.type as EAmenityType,
					})),
				})) || [];

			const mappedImages =
				draftData.images?.map((img) => ({
					id: img.id,
					url: img.url,
					target: img.target,
					roomId: img.roomId,
				})) || [];

			return {
				mappedForm: {
					rentalType: draftData.rentalType as ERentalType,
					accommodationType: draftData.type as EAccommodationType,
					accommodationId: draftData.id,
					name: draftData.name,
					description: draftData.description || "",
					address: mappedAddress,
					facilities: draftData.facilities?.map(
						(f) =>
							({
								id: f.facilityId,
								name: f.name,
								fee: f.fee ? Number(f.fee) : 0,
								note: f.note || "",
							}) as FacilityConfig
					),
					rooms: mappedRooms,
					images: mappedImages,
				},
				targetStep: draftData.currentWizardStep,
			};
		},
	});
};
