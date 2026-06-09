export class Holiday {
    public constructor(
        private readonly id: number,
        private readonly name: string,
        private readonly code: string,
        private readonly date: Date,
        private readonly isRecurring: boolean
    ) {}

    public getId(): number { return this.id; }
    public getName(): string { return this.name; }
    public getCode(): string { return this.code; }
    public getDate(): Date { return this.date; }
    public getIsRecurring(): boolean { return this.isRecurring; }

    /**
     * Domain Logic: Determines if a given target date falls within this holiday's window.
     * Encapsulates the complex recurring logic across year boundaries.
     */
    public coversDate(targetDate: Date, preDays: number, postDays: number): boolean {
        const DAY_MS = 24 * 60 * 60 * 1000;
        const targetMs = targetDate.getTime();
        
        if (!this.isRecurring) {
            const anchorMs = this.date.getTime();
            const startRange = anchorMs - preDays * DAY_MS;
            const endRange = anchorMs + postDays * DAY_MS;
            return targetMs >= startRange && targetMs <= endRange;
        }

        // For recurring holidays, we must check the anchor mapped to the target's year,
        // the previous year, and the next year, to handle windows crossing Jan 1st.
        const targetYear = targetDate.getUTCFullYear();
        const anchorMonth = this.date.getUTCMonth();
        const anchorDay = this.date.getUTCDate();

        const candidateYears = [targetYear - 1, targetYear, targetYear + 1];
        
        for (const yr of candidateYears) {
            // Reconstruct the anchor date in the candidate year
            const anchorMs = Date.UTC(yr, anchorMonth, anchorDay, -7, 0, 0); // HCM Midnight UTC offset
            const startRange = anchorMs - preDays * DAY_MS;
            const endRange = anchorMs + postDays * DAY_MS;

            if (targetMs >= startRange && targetMs <= endRange) {
                return true;
            }
        }

        return false;
    }

    public static builder() {
        return new HolidayBuilder();
    }
}

export class HolidayBuilder {
    private id?: number;
    private name?: string;
    private code?: string;
    private date?: Date;
    private isRecurring: boolean = false;

    public setId(id: number): this { this.id = id; return this; }
    public setName(name: string): this { this.name = name; return this; }
    public setCode(code: string): this { this.code = code; return this; }
    public setDate(date: Date): this { this.date = date; return this; }
    public setIsRecurring(isRecurring: boolean): this { this.isRecurring = isRecurring; return this; }

    public build(): Holiday {
        if (!this.name || !this.code || !this.date) {
            throw new Error("Missing required fields in HolidayBuilder");
        }

        // id could be undefined for new records, but since it's autoincrement in Prisma,
        // it shouldn't be randomUUID(). We will default it to 0 for unpersisted entities.
        const id = this.id ?? 0;

        return new Holiday(id, this.name, this.code, this.date, this.isRecurring);
    }
}
