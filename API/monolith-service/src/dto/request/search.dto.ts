import { Request } from "express";


export interface SemanticSearchQuery {
	q: string;
	minLat: string;
	maxLat: string;
	minLon: string;
	maxLon: string;
}

export type SemanticSearchRequest = Request<object, object, object, SemanticSearchQuery>;
