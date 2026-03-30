export interface OwnerProfileResponse {
	id: string;
	userId: string;
	businessName: string | null;
	taxId: string | null;
	contactPhone: string;
	isVerified: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface UpgradeOwnerResponse {
	user: {
		id: string;
		email: string;
		role: string;
	};
	profile: OwnerProfileResponse;
}

export interface DashboardStatsResponse {
	revenue: number;
	occupancyRate: number;
	pendingBookings: number;
}
