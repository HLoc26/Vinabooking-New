import { AccommodationFullInfo } from "../accommodation.types";
import { MatchReasonType } from "../search.types";

export interface SemanticSearchResponse {
	accommodation: AccommodationFullInfo;
	aiMatchStats: {
		finalScore: number;
		maxReviewScore: number;
		profileScore: number;
		reviewCount: number;
		matchReason: string;
		matchReasonType: MatchReasonType;
	};
}
