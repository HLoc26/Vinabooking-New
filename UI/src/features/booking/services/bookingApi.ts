import type { BookingDto } from "../types/BookingDto";

export const bookingApi = {
  async getBooking(id: string): Promise<BookingDto> {
    // mock data
    return Promise.resolve({
      id,
      startDate: "2025-10-25T14:00:00Z",
      endDate: "2025-10-28T11:00:00Z",
      guestCount: 2,
      user: {
        name: "Nguyen Quang Sang",
        email: "sang@example.com",
        phone: "0123456789",
      },
      accommodation: {
        name: "Vinpearl Resort Nha Trang",
        address: "Hon Tre Island, Nha Trang City, Vietnam",
      },
      rooms: [
        { id: "room-1", name: "Deluxe Ocean View", type: "ROOM" },
        { id: "bed-1", name: "Extra Bed for Child", type: "BED" },
      ],
    });
  },
};
