import type { RoomDetail } from "../types/BookingDto";

export interface ContextInfoAdapter {
    getInfo(): ContextInfo;
}
export type ContextInfo = {
    id: string;
    startDate: Date;
    endDate: Date;
    guestCount: number;
    referenceNo: number;
    user: {
        name: string;
        email: string;
        phone: string;
        id: string;
    };
    accommodation: {
        name: string;
        address: string;
        //image: file?
    };
    room: RoomDetail[];
}