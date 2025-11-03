export type BookingStatus =
  | "DRAFT"
  | "PENDING"
  | "CANCELLED"
  | "BOOKED"
  | "COMPLETED";

export type ItemType = "ROOM" | "BED";

export interface RoomDetail {
  id: string;
  itemId: string;
  itemType: ItemType;
  count: number;
  note?: string;
}

export interface BookingDto {
  id: string;
  startDate: string; // ISO string from backend
  endDate: string;
  guestCount: number;
  referenceNo: number;
  status: BookingStatus;
  userId: string;
  rooms: RoomDetail[];
  createdAt: string;
  updatedAt: string;
}
