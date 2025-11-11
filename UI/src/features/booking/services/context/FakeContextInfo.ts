import type { ContextInfo, ContextInfoAdapter } from "./ContextInfoAdapter";

export class FakeContextInfo implements ContextInfoAdapter {
    getInfo(): ContextInfo {
        return {
            id: "TEMP_" + Math.random().toString(36).substring(2, 9),
            startDate: new Date("2024-12-15"),
            endDate: new Date("2024-12-20"),
            guestCount: 3,
            user: {
                name: "Linksoft Linh Tran",
                email: "Linkalinh@example.com",
                phone: "0000019990",
                id: "adada-123123-xyzxyz",
            },
            referenceNo: 31312313,
            accommodation: {
                name: "Vinabooking Riverside Hotel",
                address: "123 Nguyen Hue, District 1, Ho Chi Minh City",
            },
            room:
                [{ id: "acc-001", name: "Deluxe Room 101", type: "ROOM" }],
        }
    };
}