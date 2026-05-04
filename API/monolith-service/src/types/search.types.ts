export interface BoundingBox {
	minLat: number;
	maxLat: number;
	minLon: number;
	maxLon: number;
}

export interface AccommodationMatchStats {
	accommodationId: string;
	finalScore: number;
	stats: {
		maxReviewScore: number;
		profileScore: number;
		reviewCount: number;
		matchReason: string;
		matchReasonType: MatchReasonType;
	};
}

export type MatchReasonType = "review" | "profile";
