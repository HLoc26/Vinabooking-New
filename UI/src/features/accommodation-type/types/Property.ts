import type { EAccommodationType } from "../../../../types/acommodation";

export interface Property {
	id: string;
	title: string;
	location: string;
	imageUrl: string;
	price: number;
	rating: number;
	reviews: number;
	type: EAccommodationType;
}
