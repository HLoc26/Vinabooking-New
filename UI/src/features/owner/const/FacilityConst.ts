import * as Icons from "@mui/icons-material";
import { EFacilityType } from "../../accommodation/types/accommodation.types";

export type FacilityConfig = {
	id: string;
	name: string;
	type: keyof typeof EFacilityType;
	icon: React.ElementType;
	description: string;
};

export const ALL_FACILITIES: FacilityConfig[] = [
	// GENERAL
	{ id: "wifi", name: "Free Wi-Fi", type: "GENERAL", icon: Icons.Wifi, description: "High-speed internet access" },
	{ id: "ac", name: "Air Conditioning", type: "GENERAL", icon: Icons.AcUnit, description: "Climate control in rooms" },
	{ id: "parking", name: "Parking", type: "GENERAL", icon: Icons.LocalParking, description: "On-site parking for guests" },

	// FOOD_AND_DRINK
	{ id: "restaurant", name: "Restaurant", type: "FOOD_AND_DRINK", icon: Icons.Restaurant, description: "In-house dining options" },
	{ id: "bar", name: "Bar/Lounge", type: "FOOD_AND_DRINK", icon: Icons.LocalBar, description: "Drinks and social area" },
	{ id: "kitchen", name: "Kitchen", type: "FOOD_AND_DRINK", icon: Icons.Kitchen, description: "Private or shared cooking facilities" },

	// PUBLIC_FACILITIES
	{ id: "elevator", name: "Elevator", type: "PUBLIC_FACILITIES", icon: Icons.Elevator, description: "Lift access to all floors" },
	{ id: "lobby", name: "Lobby", type: "PUBLIC_FACILITIES", icon: Icons.MeetingRoom, description: "Waiting and reception area" },

	// SERVICES
	{ id: "reception", name: "24h Reception", type: "SERVICES", icon: Icons.SupportAgent, description: "Staff available around the clock" },
	{ id: "laundry", name: "Laundry", type: "SERVICES", icon: Icons.LocalLaundryService, description: "Washing and drying services" },

	// SAFETY
	{ id: "security", name: "24h Security", type: "SAFETY", icon: Icons.Security, description: "Professional security monitoring" },
	{ id: "fire", name: "Fire Alarm", type: "SAFETY", icon: Icons.FireExtinguisher, description: "Safety smoke and fire systems" },

	// ACCESSIBILITY
	{ id: "wheelchair", name: "Wheelchair Access", type: "ACCESSIBILITY", icon: Icons.WheelchairPickup, description: "Facilities for guests with disabilities" },

	// ENTERTAINMENT
	{ id: "tv", name: "Flat-screen TV", type: "ENTERTAINMENT", icon: Icons.Tv, description: "In-room entertainment" },
	{ id: "games", name: "Game Room", type: "ENTERTAINMENT", icon: Icons.SportsEsports, description: "Recreational gaming area" },

	// OUTDOOR
	{ id: "pool", name: "Swimming Pool", type: "OUTDOOR", icon: Icons.Pool, description: "Outdoor or indoor pool" },
	{ id: "garden", name: "Garden", type: "OUTDOOR", icon: Icons.OutdoorGrill, description: "Green space or garden area" },

	// TRANSPORTATION
	{ id: "shuttle", name: "Airport Shuttle", type: "TRANSPORTATION", icon: Icons.AirportShuttle, description: "Transport to/from airport" },
	{ id: "bike", name: "Bicycle Rental", type: "TRANSPORTATION", icon: Icons.PedalBike, description: "Bikes available for hire" },

	// WELLNESS
	{ id: "gym", name: "Fitness Center", type: "WELLNESS", icon: Icons.FitnessCenter, description: "Gym and exercise equipment" },
	{ id: "spa", name: "Spa & Massage", type: "WELLNESS", icon: Icons.Spa, description: "Wellness and relaxation treatments" },

	// SPECIAL_AMENITIES
	{ id: "pet", name: "Pet Friendly", type: "SPECIAL_AMENITIES", icon: Icons.Pets, description: "Pets are allowed on property" },

	// SUSTAINABILITY
	{ id: "solar", name: "Solar Power", type: "SUSTAINABILITY", icon: Icons.SolarPower, description: "Renewable energy source" },

	// OTHER
	{ id: "other", name: "Other", type: "OTHER", icon: Icons.MoreHoriz, description: "Additional facilities" },
];
