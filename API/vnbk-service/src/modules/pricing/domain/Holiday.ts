/**
 * A holiday anchor (seeded catalog row). A non-recurring holiday has an explicit
 * calendar date; a recurring one is stored at a sentinel year and matched by MM-DD.
 */
export class Holiday {
	public readonly id: number;
	public readonly name: string;
	public readonly code: string;
	public readonly date: Date;
	public readonly isRecurring: boolean;

	public constructor(props: { id: number; name: string; code: string; date: Date; isRecurring: boolean }) {
		this.id = props.id;
		this.name = props.name;
		this.code = props.code;
		this.date = props.date;
		this.isRecurring = props.isRecurring;
	}
}
