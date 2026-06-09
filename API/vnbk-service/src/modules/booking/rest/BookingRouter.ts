import { injectable } from "tsyringe";
import { BaseRouter } from "@/http/BaseRouter";
import { BookingController } from "@/modules/booking/rest/BookingController";
import { AuthGuard } from "@/http/middleware/AuthGuard";
import { ValidationPipe } from "@/http/middleware/ValidationPipe";
import { CreateBookingRequest } from "@/modules/booking/dto/request/CreateBookingRequest";
import { ConfirmBookingRequest } from "@/modules/booking/dto/request/ConfirmBookingRequest";
import { CancelBookingRequest } from "@/modules/booking/dto/request/CancelBookingRequest";

@injectable()
export class BookingRouter extends BaseRouter {
	constructor(
		private readonly controller: BookingController,
		private readonly auth: AuthGuard,
		private readonly validate: ValidationPipe
	) {
		super();
		this.registerRoutes();
	}

	public get basePath(): string {
		return "/bookings";
	}

	protected registerRoutes(): void {
		this.router.post("/", this.auth.handle, this.validate.body(CreateBookingRequest), this.controller.createBooking);
		this.router.post("/draft", this.auth.handle, this.validate.body(CreateBookingRequest), this.controller.createDraftBooking);
		this.router.post("/confirm", this.auth.handle, this.validate.body(ConfirmBookingRequest), this.controller.confirmBooking);
		this.router.patch("/cancel", this.auth.handle, this.validate.body(CancelBookingRequest), this.controller.cancelBooking);
	}
}
