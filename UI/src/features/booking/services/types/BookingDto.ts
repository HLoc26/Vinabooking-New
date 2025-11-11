export interface RoomDetail {
  id: string;
  name: string;
  type: "ROOM" | "BED";
  note?: string;
  //roomImage: file?
}

export interface BookingDto {
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
export interface BookingImageDto {
  entity: string;
  id: string;
}