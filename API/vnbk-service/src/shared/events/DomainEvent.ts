/** Base type for domain events. `name` is used to route to handlers. */
export abstract class DomainEvent {
	public abstract readonly name: string;
}
