import type { DomainEvent } from "@/shared/events/DomainEvent";
import type { IDomainEventHandler } from "@/shared/events/IDomainEventHandler";

/** Publishes domain events to subscribed handlers, decoupling cross-module side effects. */
export interface IDomainEventPublisher {
	subscribe(eventName: string, handler: IDomainEventHandler): void;
	publish(event: DomainEvent): Promise<void>;
}
