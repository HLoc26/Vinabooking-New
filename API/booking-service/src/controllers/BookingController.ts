import type { Request, Response } from "express";
import ResponseHelper from "../utils/ResponseHelper";
import type { ApiResponse } from "../types/Response";
import BookingService from "../services/BookingService";

export default class BookingController {
    constructor(private readonly bookingService: BookingService) {}

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
    public async getBookings(req: Request, res: Response<ApiResponse>) {
        const { entity, id } = req.query;

        try {
            if (!entity || !id) {
                return ResponseHelper.error(res, "Missing 'entity' or 'id' query parameter");
            }

            let bookings;

            switch (entity) {
                case "user":
                    bookings = await this.bookingService.getBookingsByUserId(String(id));
                    break;
                case "room":
                    bookings = await this.bookingService.getBookingsByRoomId(String(id));
                    break;
                // case "accommodation":
                //     bookings = await this.bookingService.getBookingsByAccommodationId(String(id));
                //     break;
                case "booking":
                case "id":
                    bookings = await this.bookingService.getBookingById(String(id));
                    break;
                default:
                    return ResponseHelper.error(res, `Invalid entity type: ${entity}`);
            }

            return ResponseHelper.success(res, { bookings });
        } catch (err: any) {
            return ResponseHelper.error(res, err.message);
        }
    }
    public async createBooking(req: Request, res: Response<ApiResponse>) {
        try {
            const bookingData = {...req.body, status: "PENDING" };
            const newBooking = await this.bookingService.createBooking(bookingData);
            return ResponseHelper.success(res, { booking: newBooking }, 201);
        } catch (err: any) {
            return ResponseHelper.error(res, err.message);
        }
    }
    public async createDraftBooking(req: Request, res: Response<ApiResponse>) {
        try {
            const bookingData = { ...req.body, status: "DRAFT" };
            const newBooking = await this.bookingService.createBooking(bookingData);
            return ResponseHelper.success(res, { booking: newBooking }, 201);
        } catch (err: any) {
            return ResponseHelper.error(res, err.message);
        }

    }
}
