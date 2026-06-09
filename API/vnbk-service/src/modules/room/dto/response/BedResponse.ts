import { EBedType } from "@/modules/room/enums/EBedType";

/** Wire representation of a bed (decoupled from domain + persistence). */
export class BedResponse {
	id!: string;
	name!: string;
	description!: string | null;
	bedType!: EBedType;
	size!: string | null;
	quantity!: number;
	price!: number | null;
	isActive!: boolean;
}
