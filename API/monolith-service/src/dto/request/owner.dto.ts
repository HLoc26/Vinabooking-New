import { Request } from "express";


export interface UpgradeOwnerRequest extends Request {
	userId: string;
	body: {
		businessName: string;
		contactPhone: string;
		taxId?: string;
	};
}
