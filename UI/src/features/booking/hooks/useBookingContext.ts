import { FakeContextInfo } from "../services/context/FakeContextInfo";
import { useContextInfo } from "../hooks/useContextInfo";
import type { BookingDto } from "../services/types/BookingDto";
import { useState } from "react";

export function useBookingContext() {
    const adapter = new FakeContextInfo();
    const context = useContextInfo(adapter.getInfo());
    const [booking, setBooking] = useState<BookingDto>({
        id: context.id,
        startDate: context.startDate,
        endDate: context.endDate,
        guestCount: context.guestCount,
        referenceNo: context.referenceNo,
        user: {
            name: context.user.name,
            email: context.user.email,
            phone: context.user.phone,
            id: context.user.id,
        },
        accommodation: {
            name: context.accommodation.name,
            address: context.accommodation.address,
        },
        room: context.room,
    });
    return { booking, setBooking };
}