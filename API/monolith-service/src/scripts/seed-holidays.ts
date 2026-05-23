import "dotenv/config";
import prismaClient from "../clients/prisma.client";

type HolidaySeed = {
	name: string;
	code: string;
	date: string; // YYYY-MM-DD (year 2000 for recurring)
	isRecurring: boolean;
};

// Recurring Gregorian holidays — same date every year.
const RECURRING: HolidaySeed[] = [
	{ name: "New Year's Day", code: "NEW_YEAR", date: "2000-01-01", isRecurring: true },
	{ name: "Reunification Day", code: "LIBERATION", date: "2000-04-30", isRecurring: true },
	{ name: "Labor Day", code: "LABOR_DAY", date: "2000-05-01", isRecurring: true },
	{ name: "National Day", code: "NATIONAL_DAY", date: "2000-09-02", isRecurring: true },
];

// Lunar Holidays — Gregorian dates shift annually. 
// We seed anchors for the next 10 years to ensure "automatic" accuracy.
const LUNAR_ANCHORS: HolidaySeed[] = [
	// --- Tết Nguyên Đán (1/1 Lunar) ---
	{ name: "Lunar New Year 2025", code: "TET", date: "2025-01-29", isRecurring: false },
	{ name: "Lunar New Year 2026", code: "TET", date: "2026-02-17", isRecurring: false },
	{ name: "Lunar New Year 2027", code: "TET", date: "2027-02-06", isRecurring: false },
	{ name: "Lunar New Year 2028", code: "TET", date: "2028-01-26", isRecurring: false },
	{ name: "Lunar New Year 2029", code: "TET", date: "2029-02-13", isRecurring: false },
	{ name: "Lunar New Year 2030", code: "TET", date: "2030-02-03", isRecurring: false },
	{ name: "Lunar New Year 2031", code: "TET", date: "2031-01-23", isRecurring: false },
	{ name: "Lunar New Year 2032", code: "TET", date: "2032-02-11", isRecurring: false },
	{ name: "Lunar New Year 2033", code: "TET", date: "2033-01-31", isRecurring: false },
	{ name: "Lunar New Year 2034", code: "TET", date: "2034-02-19", isRecurring: false },
	{ name: "Lunar New Year 2035", code: "TET", date: "2035-02-08", isRecurring: false },

	// --- Giỗ Tổ Hùng Vương (10/3 Lunar) ---
	{ name: "Hung Kings' Festival 2025", code: "HUNG_KINGS", date: "2025-04-07", isRecurring: false },
	{ name: "Hung Kings' Festival 2026", code: "HUNG_KINGS", date: "2026-04-26", isRecurring: false },
	{ name: "Hung Kings' Festival 2027", code: "HUNG_KINGS", date: "2027-04-15", isRecurring: false },
	{ name: "Hung Kings' Festival 2028", code: "HUNG_KINGS", date: "2028-05-04", isRecurring: false },
	{ name: "Hung Kings' Festival 2029", code: "HUNG_KINGS", date: "2029-04-22", isRecurring: false },
	{ name: "Hung Kings' Festival 2030", code: "HUNG_KINGS", date: "2030-04-12", isRecurring: false },
	{ name: "Hung Kings' Festival 2031", code: "HUNG_KINGS", date: "2031-05-01", isRecurring: false },
	{ name: "Hung Kings' Festival 2032", code: "HUNG_KINGS", date: "2032-04-19", isRecurring: false },
	{ name: "Hung Kings' Festival 2033", code: "HUNG_KINGS", date: "2033-04-09", isRecurring: false },
	{ name: "Hung Kings' Festival 2034", code: "HUNG_KINGS", date: "2034-04-27", isRecurring: false },
	{ name: "Hung Kings' Festival 2035", code: "HUNG_KINGS", date: "2035-04-16", isRecurring: false },
];

async function seedHolidays() {
	const all = [...RECURRING, ...LUNAR_ANCHORS];
	console.log(`Seeding ${all.length} holiday anchors (${RECURRING.length} recurring, ${LUNAR_ANCHORS.length} shifting Lunar)…`);

	let inserted = 0;
	let skipped = 0;

	for (const h of all) {
		try {
			await prismaClient.holiday.upsert({
				where: { date_isRecurring: { date: new Date(h.date), isRecurring: h.isRecurring } },
				create: {
					name: h.name,
					code: h.code,
					date: new Date(h.date),
					isRecurring: h.isRecurring,
				},
				update: {
					name: h.name,
					code: h.code,
				},
			});
			inserted++;
		} catch (err) {
			console.error(`Failed seeding ${h.name} @ ${h.date}:`, err);
			skipped++;
		}
	}

	console.log(`Done. Upserted: ${inserted}, Skipped: ${skipped}.`);
}

seedHolidays()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prismaClient.$disconnect();
	});
