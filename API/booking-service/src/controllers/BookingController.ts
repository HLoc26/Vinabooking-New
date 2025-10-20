import type { Request, Response } from "express";
import ResponseHelper from "../utils/ResponseHelper";
import type { ApiResponse } from "../types/Response";
import BookingService from "../services/BookingService";

export default class BookingController {
    constructor(private readonly bookingService: BookingService) {}

    public async getBookingById(req: Request, res: Response<ApiResponse>) {
        const { id } = req.params;
        const booking = await this.bookingService.getBookingById(id);
        return ResponseHelper.success(res, { booking });
    }
}
