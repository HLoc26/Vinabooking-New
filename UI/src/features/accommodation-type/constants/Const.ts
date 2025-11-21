import { EAccommodationType } from "../../../types/acommodation";

export const ACCOMMODATION_LABELS: Partial<Record<EAccommodationType, string>> = {
	[EAccommodationType.HOTEL]: "Hotel",
	[EAccommodationType.APARTMENT]: "Apartment",
	[EAccommodationType.VILLA]: "Villa",
	[EAccommodationType.VACATION_HOME]: "Vacation Home",
	[EAccommodationType.GUESTHOUSE]: "Guesthouse",
	[EAccommodationType.HOSTEL]: "Hostel",
	[EAccommodationType.BED_AND_BREAKFAST]: "Bed & Breakfast",
};

export const ACCOMMODATION_QUOTES: Partial<Record<EAccommodationType, string>> = {
	[EAccommodationType.HOTEL]: "Experience world-class service and comfort.",
	[EAccommodationType.APARTMENT]: "Enjoy the freedom of your own space with city views.",
	[EAccommodationType.VILLA]: "Private luxury retreats for you and your loved ones.",
	[EAccommodationType.VACATION_HOME]: "Your home away from home in beautiful destinations.",
	[EAccommodationType.GUESTHOUSE]: "Cozy stays with local charm and hospitality.",
	[EAccommodationType.HOSTEL]: "Meet new friends and explore on a budget.",
	[EAccommodationType.BED_AND_BREAKFAST]: "Wake up to homemade breakfast and warm vibes.",
};

export const ACCOMMODATION_HERO_IMAGES: Partial<Record<EAccommodationType, string>> = {
	[EAccommodationType.HOTEL]: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&auto=format&fit=crop&q=80",
	[EAccommodationType.APARTMENT]: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1600&auto=format&fit=crop&q=80",
	[EAccommodationType.VILLA]: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&auto=format&fit=crop&q=80",
	[EAccommodationType.VACATION_HOME]: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1600&auto=format&fit=crop&q=80",
	[EAccommodationType.GUESTHOUSE]: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1600&auto=format&fit=crop&q=80",
	[EAccommodationType.HOSTEL]: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1600&auto=format&fit=crop&q=80",
	[EAccommodationType.BED_AND_BREAKFAST]: "https://images.unsplash.com/photo-1505691938895-1cd109b436a5?w=1600&auto=format&fit=crop&q=80",
};

// Keep basic cities structure but they can be enhanced dynamically in App.tsx
export const CITY_NAMES = ["Da Nang", "Ho Chi Minh City", "Hanoi", "Hoi An", "Phu Quoc", "Nha Trang", "Da Lat", "Sapa"];
