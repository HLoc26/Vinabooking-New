import BookingRepository from "../repositories/BookingRepository";

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
}

// export interface BookingResponse {
//     booking: {
//         id: string;
//         startDate: Date;
//         endDate: Date;
//         guestCount: number;
//         referenceNo: number;
//         status: string;
//         userId: string;
//         phone: string | null;
//         details: {
//             id: string;
//             itemId: string;
//             itemType: string;
//             count: number;
//             note?: string;
//         }[];
//     };
// }
export type BookingResponse = Awaited<ReturnType<BookingRepository["createBooking"]>>;