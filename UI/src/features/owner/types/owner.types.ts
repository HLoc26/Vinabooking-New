export interface OwnerProfileData {
	id: string;
	userId: string;
	businessName: string | null;
	taxId: string | null;
	contactPhone: string;
	isVerified: boolean;
}

export interface UpgradeOwnerPayload {
	businessName?: string;
	taxId?: string;
	contactPhone: string;
}
