import type { AccommodationDetail } from "../../accommodation/types/accommodation.types";

export interface SemanticSearchParams {
	query: string;
	boundingBox: {
		minLat: number;
		maxLat: number;
		minLon: number;
		maxLon: number;
	};
}

export interface SemanticSearchMatch {
  accommodation: AccommodationDetail;
  aiMatchStats: {
    finalScore: number;
    matchReason?: string;
  };
}
