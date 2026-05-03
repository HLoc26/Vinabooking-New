import type { AccommodationDetail } from "../../accommodation/types/accommodation.types";

export interface SemanticSearchParams {
  query: string;
  city: string;
  lat: number;
  lng: number;
}

export interface SemanticSearchMatch {
  accommodation: AccommodationDetail;
  aiMatchStats: {
    finalScore: number;
    matchReason?: string;
  };
}
