import type { BookingContextInfo } from "../types/BookingContextInfo";
import type { ContextInfoAdapter } from "./ContextInfoAdapter";

export class FakeContextInfo implements ContextInfoAdapter {
	getInfo(): BookingContextInfo {
		return {
			startDate: new Date("2024-12-15"),
			endDate: new Date("2024-12-20"),
			guestCount: 3,
			accommodationId: "24fe3148-ca50-4d74-8bb3-78e0280bede0",
			items: [
				{ id: "e321d131-6df0-4047-8bc6-a326cb3f039f", itemType: "ROOM", count: 1 },
				{ id: "e94cfce0-af0d-42e5-9547-f33931e04cc8", itemType: "ROOM", count: 1 },
			],
		};
	}
}
