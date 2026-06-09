/** Base class for domain entities — identity-based equality on a string id. */
export abstract class Entity {
	protected constructor(public readonly id: string) {}

	public equals(other?: Entity): boolean {
		if (other === undefined || other === null) return false;
		if (this === other) return true;
		return this.id === other.id;
	}
}
