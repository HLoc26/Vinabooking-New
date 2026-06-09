import { EAccommodationType } from "@/modules/accommodation/enums/EAccommodationType";

/** Published-accommodation count per type. */
export class TypeCount {
	type!: EAccommodationType;
	count!: number;
}

/** Published-accommodation count per city. */
export class CityCount {
	city!: string;
	count!: number;
}

/** Wire representation of `GET /accommodations/stats` (homepage aggregates). */
export class HomepageStatsResponse {
	types!: TypeCount[];
	cities!: CityCount[];
}
