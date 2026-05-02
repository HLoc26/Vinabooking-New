export interface AccommodationMatchStats {
	accommodationId: string;
	finalScore: number;
	stats: {
		maxReviewScore: number;
		profileScore: number;
		reviewCount: number;
	};
}
