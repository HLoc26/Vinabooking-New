export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
}

export interface BookingResponse {
    booking: {
        id: string;
        startDate: string;
        endDate: string;
        guestCount: number;
        referenceNo: number;
        status: string;
        userId: string;
        createdAt: string;
        updatedAt: string;
        details: {
            id: string;
            itemId: string;
            itemType: string;
            count: number;
            note?: string;
        }[];
    };
}
