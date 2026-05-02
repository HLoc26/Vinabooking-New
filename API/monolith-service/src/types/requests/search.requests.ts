import { Request } from "express";

export interface SemanticSearchQuery {
	q: string;
	l: string;
}

export type SemanticSearchRequest = Request<object, object, object, SemanticSearchQuery>;
