export interface BookedRoomCount {
    roomId: string;
    bookedCount: number;
}

export interface BookingSummaryResponse {
    success: boolean;
    data: BookedRoomCount[];
}