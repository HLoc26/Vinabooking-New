import { v4 as uuidv4 } from "uuid";
import { BadRequestError } from "@/errors";

export class AccommodationReviewSummary {
	readonly #id: string;
	readonly #content: string;
	readonly #updatedAt: Date;
	readonly #accommodationId: string;

	constructor(id: string, content: string, updatedAt: Date, accommodationId: string) {
		this.#id = id;
		this.#content = content;
		this.#updatedAt = updatedAt;
		this.#accommodationId = accommodationId;
	}

	public getId(): string { return this.#id; }
	public getContent(): string { return this.#content; }
	public getUpdatedAt(): Date { return this.#updatedAt; }
	public getAccommodationId(): string { return this.#accommodationId; }
}

export class AccommodationReviewSummaryBuilder {
	#id: string = uuidv4();
	#content: string = "";
	#updatedAt: Date = new Date();
	#accommodationId: string = "";

	public setId(id: string): AccommodationReviewSummaryBuilder {
		this.#id = id;
		return this;
	}

	public setContent(content: string): AccommodationReviewSummaryBuilder {
		this.#content = content;
		return this;
	}

	public setUpdatedAt(updatedAt: Date): AccommodationReviewSummaryBuilder {
		this.#updatedAt = updatedAt;
		return this;
	}

	public setAccommodationId(accommodationId: string): AccommodationReviewSummaryBuilder {
		this.#accommodationId = accommodationId;
		return this;
	}

	public build(): AccommodationReviewSummary {
		if (!this.#accommodationId) throw new BadRequestError("AccommodationReviewSummary must have an accommodationId");
		if (!this.#content) throw new BadRequestError("AccommodationReviewSummary must have content");

		return new AccommodationReviewSummary(this.#id, this.#content, this.#updatedAt, this.#accommodationId);
	}
}
