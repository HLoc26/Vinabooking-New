import { Entity } from "@/shared/domain/Entity";
import type { DomainEvent } from "@/shared/events/DomainEvent";

/**
 * Base class for aggregate roots — the consistency boundary of a domain model.
 * Records domain events raised during behavior; the service drains and publishes
 * them after persistence.
 */
export abstract class AggregateRoot extends Entity {
	private readonly _domainEvents: DomainEvent[] = [];

	protected addDomainEvent(event: DomainEvent): void {
		this._domainEvents.push(event);
	}

	public pullDomainEvents(): DomainEvent[] {
		const events = [...this._domainEvents];
		this._domainEvents.length = 0;
		return events;
	}
}
