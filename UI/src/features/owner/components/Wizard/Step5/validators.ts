import type { EAccommodationType, ERentalType } from "../../../../accommodation/types/accommodation.types";
import type { RoomForm } from "../../../types/owner.types";

export const MAX_PRICE = 100000000; // 100 Million VND

export const validateRoomForSave = (room: RoomForm, rentalType: ERentalType, accommodationType: EAccommodationType): { isValid: boolean; errors: string[] } => {
	const isEntirePlace = rentalType === "ENTIRE_PLACE" ? true : false;
	const nameToCheck = (isEntirePlace ? accommodationType : room.name)?.trim();
	
	const basePrice = Number(room.basePrice ?? room.price);
	const floorPrice = Number(room.floorPrice ?? basePrice);

	const errors: string[] = [];

	// Name
	if (!nameToCheck) errors.push("room name is required");

	// Base Price
	if (isNaN(basePrice) || basePrice <= 0) {
		errors.push("room price is required");
	} else if (basePrice < 1000) {
		errors.push("room price must be at least 1,000 VND");
	} else if (basePrice > MAX_PRICE) {
		errors.push("room price exceeds 100,000,000 VND");
	}

	// Floor Price
	if (!isNaN(floorPrice)) {
		if (floorPrice < 0) {
			errors.push("floor price cannot be negative");
		} else if (floorPrice > basePrice) {
			errors.push("floor price cannot exceed base price");
		}
	}

	// Guest capacity
	if (room.maxAdults < 1) errors.push("guest capacity (min 1 adult)");

	// Size
	const size = room.size ?? 0;
	if (size > 0 && size < 5) errors.push("room size must be at least 5 m²");

	// Bed validation
	if (!room.beds?.length) {
		errors.push("at least one bed is required");
	} else {
		room.beds.forEach((bed, i) => {
			if (!bed.name?.trim()) errors.push(`bed #${i + 1} name is required`);
			if (!bed.bedType) errors.push(`bed #${i + 1} type is required`);
			if (!bed.size) errors.push(`bed #${i + 1} size is required`);
			const qty = bed.quantity ?? 1;
			if (!qty || qty < 1) errors.push(`bed #${i + 1} quantity (min 1)`);
			const bedPrice = Number(bed.price || 0);
			if (bedPrice > MAX_PRICE) errors.push(`bed #${i + 1} price exceeds 100,000,000 VND`);
		});
	}

	return { isValid: errors.length === 0, errors };
};
