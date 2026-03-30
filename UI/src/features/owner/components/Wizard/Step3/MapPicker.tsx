import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { useEffect } from "react";
import { Box } from "@mui/material";

type Props = {
	lat: number | null;
	lng: number | null;
	onChange: (data: any) => void;
};

function ClickHandler({ onChange }: { onChange: (data: any) => void }) {
	useMapEvents({
		async click(e) {
			const { lat, lng } = e.latlng;

			try {
				// 🛰️ Switched to Nominatim Reverse Geocoding API
				const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`, {
					headers: {
						"User-Agent": "Vinabooking-App/1.0", // 🛡️ Mandatory for Nominatim
					},
				});

				if (!res.ok) throw new Error(`Nominatim Error: ${res.status}`);

				const data = await res.json();
				const addr = data.address || {};

				onChange({
					latitude: lat,
					longitude: lng,
					fullAddress: data.display_name || "",
					// Nominatim has slightly different address keys than LocationIQ
					street: addr.road || addr.pedestrian || addr.house_number || "",
					ward: addr.suburb || addr.village || addr.neighbourhood || addr.hamlet || "",
					district: addr.city_district || addr.county || addr.state_district || "",
					city: addr.city || addr.town || addr.state || "",
					country: addr.country || "",
				});
			} catch (err) {
				console.error("Reverse geocode failed:", err);
				// Still update coordinates so the pin moves even if API fails
				onChange({
					latitude: lat,
					longitude: lng,
				});
			}
		},
	});
	return null;
}

function Recenter({ lat, lng }: { lat: number | null; lng: number | null }) {
	const map = useMap();
	useEffect(() => {
		if (lat && lng) {
			map.setView([lat, lng], 16);
		}
	}, [lat, lng, map]);
	return null;
}

export default function MapPicker({ lat, lng, onChange }: Props) {
	// Default to Ho Chi Minh City if no lat/lng provided
	const defaultPosition: [number, number] = [10.7769, 106.7009];
	const position: [number, number] = lat && lng ? [lat, lng] : defaultPosition;

	return (
		<Box
			sx={{
				height: 400,
				width: "100%",
				borderRadius: 2,
				overflow: "hidden",
				mt: 2,
				border: "1px solid #ccc",
				position: "relative", // Ensures children don't float away
			}}
		>
			<MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
				{/* 🗺️ Standard OpenStreetMap Tiles */}
				<TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

				<ClickHandler onChange={onChange} />
				<Recenter lat={lat} lng={lng} />

				{lat && lng && <Marker position={[lat, lng]} />}
			</MapContainer>
		</Box>
	);
}
