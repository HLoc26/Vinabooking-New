import { EFacilityType } from "@/modules/accommodation/enums/EFacilityType";

/**
 * Wire representation of an accommodation facility — the join-row id plus the
 * resolved catalog facility's name/type/description and the per-accommodation
 * fee + note. Mirrors the monolith's normalized facility shape.
 */
export class FacilityConfigResponse {
	id!: string;
	name!: string;
	type!: EFacilityType;
	description!: string | null;
	fee!: number;
	note!: string | null;
}
