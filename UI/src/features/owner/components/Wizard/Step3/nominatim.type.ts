export interface NominatimAddress {
	city?: string;
	town?: string;
	village?: string;
	state_district?: string;
	state?: string;
	"ISO3166-2-lvl4"?: string;
	postcode?: string;
	country: string;
	country_code: string;
}

export interface NominatimExtraTags {
	capital?: string;
	website?: string;
	wikidata?: string;
	wikipedia?: string;
	population?: string;
	[key: string]: string | undefined; // Flexible for other OSM tags
}

export interface NominatimResponse {
	place_id: number;
	licence: string;
	osm_type: "node" | "way" | "relation";
	osm_id: string;
	boundingbox: [string, string, string, string]; // [lat_min, lat_max, lon_min, lon_max]
	lat: string;
	lon: string;
	display_name: string;
	name: string;
	class: string;
	type: string;
	importance: number;
	icon?: string;
	address: NominatimAddress;
	extratags?: NominatimExtraTags;
}
