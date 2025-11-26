import axios from "axios";
import { BookingPayload } from "../types/Booking";
import { ApiResponse } from "../types/Response";
import NotFoundError from "../errors/NotFoundError";
import EnvironmentNotSetError from "../errors/EnvironmentNotSetError";

class BookingServiceClient {
	private axiosInstance;
	constructor(private bookingServiceUrl: string) {
		if (!bookingServiceUrl) {
			throw new EnvironmentNotSetError("Missing environment variable BOOKING_ENDPOINT");
		}

		this.axiosInstance = axios.create({ baseURL: bookingServiceUrl });
	}

	public async getBooking(id: string) {
		try {
			const res = await this.axiosInstance.get<ApiResponse<BookingPayload>>("/internal", { params: { entity: "id", id } });
			if (!res.data) throw new NotFoundError(`Booking with id ${id} not found`);
			const booking = res.data.data;
			return booking;
		} catch (e: unknown) {
			const error = e as Error;
			console.error(error);
		}
	}
}

export default BookingServiceClient;
