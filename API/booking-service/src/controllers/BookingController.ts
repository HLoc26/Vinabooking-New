import type { Request, Response } from "express";
import ResponseHelper from "../utils/ResponseHelper";
import type { ApiResponse } from "../types/Response";
import BookingService from "../services/BookingService";
import { AuthenticatedRequest, BookingRequest } from "../types/Request";
import BookingRepository from "../repositories/BookingRepository";
import { BookingResponse } from "../types/Response";
import AccommodationServiceClient from "../clients/AccommodationServiceClient";

export default class BookingController {
    constructor(private readonly bookingService: BookingService, private readonly bookingRepository: BookingRepository) { }
    // public async getBookingById(req: Request, res: Response<ApiResponse>) {
    //     try {
    //         const { id } = req.params;
    //         const booking = await this.bookingService.getBookingById(id);
    //         return ResponseHelper.success(res, { booking });
    //     } catch (err: any) {
    //         return ResponseHelper.error(res, err.message);
    //     }
    // }

    // public async getBookingsByUserId(req: Request, res: Response<ApiResponse>) {
    //     try {
    //         const { userId } = req.params;
    //         const bookings = await this.bookingService.getBookingsByUserId(userId);
    //         return ResponseHelper.success(res, { bookings });
    //     } catch (err: any) {
    //         return ResponseHelper.error(res, err.message);
    //     }
    // }
    public async getBookings(req: Request, res: Response<ApiResponse<BookingResponse | BookingResponse[]>>) {
        const { entity, id } = req.query;

        try {
            if (!entity || !id) {
                return ResponseHelper.error(
                    res,
                    "Missing 'entity' or 'id' query parameter"
                );
            }

            let bookings;

            switch (entity) {
                // case "accommodation":
                //     bookings = await AccommodationServiceClient.getAccommodationsByRoomId(String(id));
                //     break;
                case "user":
                    bookings = await this.bookingService.getBookingsByUserId(String(id));
                    break;
                case "room":
                    bookings = await this.bookingService.getBookingsByRoomId(String(id));
                    break;
                case "booking":
                case "id":
                    bookings = await this.bookingService.getBookingById(String(id));
                    break;
                default:
                    return ResponseHelper.error(res, `Invalid entity type: ${entity}`);
            }
            return ResponseHelper.success(res, bookings);
        } catch (err: unknown) {
            const e = err as Error;
            return ResponseHelper.error(res, e.message);
        }
    }
    public async createBooking(
        req: AuthenticatedRequest,
        res: Response<ApiResponse<BookingResponse>>
    ) {
        try {
            const userId = req.user?.id; // comes from middleware
            if (!userId) {
                return ResponseHelper.error(res, "User not authenticated");
            }

            const bookingData = {
                ...req.body,
                userId, // attach authenticated user
                status: "PENDING",
            };

            const newBooking = await this.bookingRepository.createBooking(bookingData);
            return ResponseHelper.success(res, newBooking, 201);
        } catch (err: unknown) {
            const e = err as Error;
            return ResponseHelper.error(res, e.message);
        }
    public async createDraftBooking(req: BookingRequest, res: Response<ApiResponse<BookingResponse>>) {
        try {
            const bookingData = { ...req.body, status: "DRAFT" };
            const newBooking = await this.bookingRepository.createBooking(bookingData);
            return ResponseHelper.success(res, newBooking, 201);
        } catch (err: unknown) {
            const e = err as Error;
            return ResponseHelper.error(res, e.message);
        }
    }
}
