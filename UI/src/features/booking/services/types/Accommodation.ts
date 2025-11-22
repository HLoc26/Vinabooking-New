type Facility = {
	id: string;
	name: string;
	type: string;
	description: string;
};

type FacilityConfig = {
	id: string;
	fee: number;
	note: string;
	isAvailable: boolean;
	facility: Facility;
};

export type AccommodationInfo = {
	id: string;
	name: string;
	description: string;
	address: { fullAddress: string };
	facilities: FacilityConfig[];
};
