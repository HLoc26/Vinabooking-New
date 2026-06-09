import { v4 as uuidv4 } from "uuid";
import { BadRequestError } from "@/errors";

export class Review {
	readonly #id: string;
	readonly #star: number | null;
	readonly #comment: string;
	readonly #createdAt: Date;
	readonly #updatedAt: Date;
	readonly #userId: string;
	readonly #accommodationId: string;
	readonly #bookingId: string | null;
	readonly #parentId: string | null;
	#replies: Review[] = [];

	constructor(
		id: string,
		star: number | null,
		comment: string,
		createdAt: Date,
		updatedAt: Date,
		userId: string,
		accommodationId: string,
		bookingId: string | null,
		parentId: string | null,
		replies?: Review[]
	) {
		this.#id = id;
		this.#star = star;
		this.#comment = comment;
		this.#createdAt = createdAt;
		this.#updatedAt = updatedAt;
		this.#userId = userId;
		this.#accommodationId = accommodationId;
		this.#bookingId = bookingId;
		this.#parentId = parentId;
		if (replies) {
			this.#replies = replies;
		}
	}

	public getId(): string { return this.#id; }
	public getStar(): number | null { return this.#star; }
	public getComment(): string { return this.#comment; }
	public getCreatedAt(): Date { return this.#createdAt; }
	public getUpdatedAt(): Date { return this.#updatedAt; }
	public getUserId(): string { return this.#userId; }
	public getAccommodationId(): string { return this.#accommodationId; }
	public getBookingId(): string | null { return this.#bookingId; }
	public getParentId(): string | null { return this.#parentId; }
	public getReplies(): Review[] { return this.#replies; }
	public isReply(): boolean { return this.#parentId !== null; }
}

export class ReviewBuilder {
	#id: string = uuidv4();
	#star: number | null = null;
	#comment: string = "";
	#createdAt: Date = new Date();
	#updatedAt: Date = new Date();
	#userId: string = "";
	#accommodationId: string = "";
	#bookingId: string | null = null;
	#parentId: string | null = null;
	#replies: Review[] = [];

	public setId(id: string): ReviewBuilder {
		this.#id = id;
		return this;
	}

	public setStar(star: number | null): ReviewBuilder {
		this.#star = star;
		return this;
	}

	public setComment(comment: string): ReviewBuilder {
		this.#comment = comment;
		return this;
	}

	public setCreatedAt(createdAt: Date): ReviewBuilder {
		this.#createdAt = createdAt;
		return this;
	}

	public setUpdatedAt(updatedAt: Date): ReviewBuilder {
		this.#updatedAt = updatedAt;
		return this;
	}

	public setUserId(userId: string): ReviewBuilder {
		this.#userId = userId;
		return this;
	}

	public setAccommodationId(accommodationId: string): ReviewBuilder {
		this.#accommodationId = accommodationId;
		return this;
	}

	public setBookingId(bookingId: string | null): ReviewBuilder {
		this.#bookingId = bookingId;
		return this;
	}

	public setParentId(parentId: string | null): ReviewBuilder {
		this.#parentId = parentId;
		return this;
	}

	public setReplies(replies: Review[]): ReviewBuilder {
		this.#replies = replies;
		return this;
	}

	public build(): Review {
		if (!this.#userId) throw new BadRequestError("Review must have a userId");
		if (!this.#accommodationId) throw new BadRequestError("Review must have an accommodationId");
		if (!this.#comment) throw new BadRequestError("Review must have a comment");

		if (this.#parentId) {
			// This is a reply
			if (this.#star !== null) throw new BadRequestError("Replies cannot have a star rating");
			if (this.#bookingId !== null) throw new BadRequestError("Replies cannot have a bookingId");
		} else {
			// This is a main review
			if (this.#star === null) throw new BadRequestError("Main reviews must have a star rating");
			if (this.#bookingId === null) throw new BadRequestError("Main reviews must have a bookingId");
		}

		return new Review(
			this.#id,
			this.#star,
			this.#comment,
			this.#createdAt,
			this.#updatedAt,
			this.#userId,
			this.#accommodationId,
			this.#bookingId,
			this.#parentId,
			this.#replies
		);
	}
}
