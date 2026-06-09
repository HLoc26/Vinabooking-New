/** A persisted owner-wide holiday opt-in row. */
export class HolidayOptInResponse {
	id!: string;
	holidayCode!: string;
	priceMultiplier!: number;
	preDays!: number;
	postDays!: number;
	enabled!: boolean;
}
