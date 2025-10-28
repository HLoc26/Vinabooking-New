export interface RoomDetail {
  id: string;
  name: string;
  type: "ROOM" | "BED";
  note?: string;
}

export interface BookingDto {
  id: string;
  startDate: string;
  endDate: string;
  guestCount: number;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  accommodation: {
    name: string;
    address: string;
  };
  rooms: RoomDetail[];
}
