import { Decimal } from "@prisma/client/runtime/client";

/**
 * Arbitrary-precision monetary value object for the pricing engine.
 *
 * Wraps Decimal.js (the same implementation behind `Prisma.Decimal`) so the
 * pricing math reproduces the monolith's `Prisma.Decimal` semantics exactly,
 * while keeping the service/domain free of any `@/generated/client` import
 * (the entity/query types stay encapsulated in the DAO). The DAO hands money in
 * as decimal strings; the engine computes; results are rounded with `toFixed`.
 */
export class Money {
	private readonly value: Decimal;

	private constructor(value: Decimal) {
		this.value = value;
	}

	public static of(value: Money | number | string): Money {
		if (value instanceof Money) return value;
		return new Money(new Decimal(value));
	}

	public static zero(): Money {
		return new Money(new Decimal(0));
	}

	public static one(): Money {
		return new Money(new Decimal(1));
	}

	public plus(other: Money): Money {
		return new Money(this.value.plus(other.value));
	}

	public minus(other: Money): Money {
		return new Money(this.value.minus(other.value));
	}

	public mul(other: Money | number): Money {
		const factor = other instanceof Money ? other.value : other;
		return new Money(this.value.mul(factor));
	}

	public dividedBy(other: Money | number): Money {
		const divisor = other instanceof Money ? other.value : other;
		return new Money(this.value.dividedBy(divisor));
	}

	public lessThan(other: Money): boolean {
		return this.value.lessThan(other.value);
	}

	public greaterThan(other: Money): boolean {
		return this.value.greaterThan(other.value);
	}

	public equals(other: Money): boolean {
		return this.value.equals(other.value);
	}

	/** Fixed-point string (e.g. "1500000.00"). Mirrors `Prisma.Decimal.toFixed`. */
	public toFixed(decimalPlaces: number): string {
		return this.value.toFixed(decimalPlaces);
	}

	/** Rounded JS number for wire serialization (e.g. `Number(value.toFixed(2))`). */
	public toNumber(decimalPlaces: number): number {
		return Number(this.value.toFixed(decimalPlaces));
	}
}
