import crypto from "crypto";
import { injectable } from "tsyringe";

/**
 * Produces a deterministic SHA-256 over a quote payload so the booking module
 * can detect tampering between quote and checkout (spec §1.4). Object keys are
 * sorted before hashing; objects exposing `toJSON` (Date, Decimal) serialize
 * through it — making the hash stable regardless of property insertion order.
 */
@injectable()
export class QuoteHasher {
	public hash(payload: unknown): string {
		return crypto.createHash("sha256").update(this.canonicalize(payload)).digest("hex");
	}

	public canonicalize(obj: unknown): string {
		if (obj === null || typeof obj !== "object") {
			return JSON.stringify(obj);
		}

		// Objects with a toJSON method (Date, Prisma.Decimal, etc.).
		if (typeof (obj as { toJSON?: unknown }).toJSON === "function") {
			return JSON.stringify((obj as { toJSON: () => unknown }).toJSON());
		}

		if (Array.isArray(obj)) {
			return "[" + obj.map((x) => this.canonicalize(x)).join(",") + "]";
		}

		const keys = Object.keys(obj as Record<string, unknown>).sort();
		return "{" + keys.map((k) => JSON.stringify(k) + ":" + this.canonicalize((obj as Record<string, unknown>)[k])).join(",") + "}";
	}
}
