export interface CityStat {
	city: string;
	count: number;
}

export interface TypeStat {
	type: string;
	count: number;
}

export interface StatsResponse {
	types: TypeStat[];
	cities: CityStat[];
}
