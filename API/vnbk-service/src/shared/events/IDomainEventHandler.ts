import type { DomainEvent } from "@/shared/events/DomainEvent";

/** Handles a specific domain event type. */
export interface IDomainEventHandler<TEvent extends DomainEvent = DomainEvent> {
	handle(event: TEvent): Promise<void>;
}
