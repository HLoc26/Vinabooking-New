export interface CityStat {
	city: string;
	count: number;
}

export interface TypeStat {
	type: string;
	count: number;
}

export interface StatsResponse {
	success: boolean;
	data: {
		types: TypeStat[];
		cities: CityStat[];
	};
	error: string | null;
}

export interface StatsContextValue {
	loading: boolean;
	error: string | null;
	cities: CityStat[];
	types: TypeStat[];
}
