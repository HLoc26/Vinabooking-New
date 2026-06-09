/** Wire representation of `GET /accommodations/count`. */
export class AccommodationCountResponse {
	city!: string | null;
	type!: string | null;
	count!: number;
}
