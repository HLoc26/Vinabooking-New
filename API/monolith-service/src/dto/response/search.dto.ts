import { AccommodationFullInfo } from "@/dto/response/accommodation.dto";
import { MatchReasonType } from "../../types/search.types";


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
