import type { DependencyContainer } from "@/di/container";
import type { IModule } from "@/di/IModule";
import { ROUTER } from "@/http/http.tokens";
import { EVENT_PUBLISHER } from "@/infrastructure/infrastructure.tokens";
import type { IDomainEventPublisher } from "@/shared/events/IDomainEventPublisher";
import { BOOKING_SERVICE, BOOKING_REPOSITORY, BOOKING_FACTORY, BOOKING_TIMEOUT_SCHEDULER } from "@/modules/booking/booking.tokens";
import { BookingDao } from "@/modules/booking/dao/BookingDao";
import { BookingServiceImpl } from "@/modules/booking/service/impl/BookingServiceImpl";
import { BookingFactoryImpl } from "@/modules/booking/service/impl/BookingFactoryImpl";
import { LoggingBookingTimeoutScheduler } from "@/modules/booking/service/impl/LoggingBookingTimeoutScheduler";
import { BookingRouter } from "@/modules/booking/rest/BookingRouter";
import { BookingConfirmedEvent } from "@/modules/booking/events/BookingConfirmedEvent";
import { BookingCancelledEvent } from "@/modules/booking/events/BookingCancelledEvent";
import { SendBookingConfirmationEmailHandler } from "@/modules/booking/events/handlers/SendBookingConfirmationEmailHandler";
import { SendBookingCancellationEmailHandler } from "@/modules/booking/events/handlers/SendBookingCancellationEmailHandler";

/**
 * Wires the booking module: repository port -> DAO, service/factory/timeout
 * ports -> impls, its router, and the two domain-event handlers. After the
 * bindings are in place it resolves the shared EVENT_PUBLISHER and SUBSCRIBES
 * each handler to its event name — so when the service publishes a
 * BookingConfirmed/Cancelled event, the email side effects run in the handlers
 * (cross-module, decoupled), never inline in the service.
 *
 * No module depends on booking, so all injection here is plain constructor
 * injection — no setter injection, no `delay()`, no dependency cycle.
 */
export class BookingModule implements IModule {
	public register(container: DependencyContainer): void {
		container.registerSingleton(BOOKING_REPOSITORY, BookingDao);
		container.registerSingleton(BOOKING_FACTORY, BookingFactoryImpl);
		container.registerSingleton(BOOKING_TIMEOUT_SCHEDULER, LoggingBookingTimeoutScheduler);
		container.registerSingleton(BOOKING_SERVICE, BookingServiceImpl);

		// Event handlers (cross-module side effects) are singletons too.
		container.registerSingleton(SendBookingConfirmationEmailHandler);
		container.registerSingleton(SendBookingCancellationEmailHandler);

		container.registerSingleton(ROUTER, BookingRouter);

		// Subscribe the handlers to their events via the shared in-process bus.
		const publisher = container.resolve<IDomainEventPublisher>(EVENT_PUBLISHER);
		publisher.subscribe(BookingConfirmedEvent.NAME, container.resolve(SendBookingConfirmationEmailHandler));
		publisher.subscribe(BookingCancelledEvent.NAME, container.resolve(SendBookingCancellationEmailHandler));
	}
}
