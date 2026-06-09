import { singleton } from "tsyringe";
import type { DomainEvent } from "@/shared/events/DomainEvent";
import type { IDomainEventHandler } from "@/shared/events/IDomainEventHandler";
import type { IDomainEventPublisher } from "@/shared/events/IDomainEventPublisher";

/**
 * Synchronous, in-process event bus. Handlers run within the publishing request,
 * keeping behavior equivalent to direct calls while decoupling the modules.
 */
@singleton()
export class InProcessEventPublisher implements IDomainEventPublisher {
	private readonly handlers = new Map<string, IDomainEventHandler[]>();

	public subscribe(eventName: string, handler: IDomainEventHandler): void {
		const existing = this.handlers.get(eventName) ?? [];
		existing.push(handler);
		this.handlers.set(eventName, existing);
	}

	public async publish(event: DomainEvent): Promise<void> {
		const handlers = this.handlers.get(event.name) ?? [];
		for (const handler of handlers) {
			await handler.handle(event);
		}
	}
}
