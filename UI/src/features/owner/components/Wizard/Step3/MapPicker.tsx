import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { usePushNotificationContext } from "../../../../../context/PushNotification/hook";
import type { WizardForm } from "../../../types/owner.types";

type Props = Readonly<{
	lat: number | null;
	lng: number | null;
	onChange: (data: Partial<WizardForm["address"]>) => void;
	readOnly?: boolean;
}>;

function MapSizeFixer() {
	const map = useMap();
	useEffect(() => {
		const timer = setTimeout(() => {
			map.invalidateSize();
		}, 250);
		return () => clearTimeout(timer);
	}, [map]);
	return null;
}

function ClickHandler({ onChange }: Readonly<{ onChange: (data: Partial<WizardForm["address"]>) => void }>) {
	const { pushNotification } = usePushNotificationContext();

	useMapEvents({
		async click(e) {
			const { lat, lng } = e.latlng;

			try {
				const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`, { headers: { "User-Agent": "Vinabooking-App/1.0" } });
				if (!res.ok) throw new Error(`Nominatim ${res.status}`);

				const data = await res.json();
				const addr = data.address || {};

				// Derive a clean English country name
				const country = addr.country || "";

				// City: prefer city > town > state
				const city = addr.city || addr.town || addr.municipality || addr.county || addr.state_district || addr.state || "";

				onChange({
					latitude: lat,
					longitude: lng,
					fullAddress: data.display_name || "",
					street: [addr.house_number, addr.road || addr.pedestrian].filter(Boolean).join(" "),
					city,
					country,
					// pass raw ISO code if available
					countryCode: addr["ISO3166-2-lvl4"]?.split("-")[0] || "",
				});
			} catch (err) {
				console.error("Reverse geocode failed:", err);
				pushNotification("Reverse geocode failed. Please select your country and city manually.", "warning");
				onChange({ latitude: lat, longitude: lng });
			}
		},
	});
	return null;
}

function Recenter({ lat, lng }: Readonly<{ lat: number | null; lng: number | null }>) {
	const map = useMap();
	useEffect(() => {
		if (lat && lng) map.setView([lat, lng] as LatLngExpression, 14);
	}, [lat, lng, map]);
	return null;
}

export default function MapPicker({ lat, lng, onChange, readOnly = false }: Props) {
	const defaultPosition: LatLngExpression = [10.7769, 106.7009];
	const position: LatLngExpression = lat && lng ? [lat, lng] : defaultPosition;

	return (
		<Box
			sx={{
				position: "relative",
				height: 380,
				width: "100%",
				borderRadius: 3,
				overflow: "hidden",
				border: "1px solid",
				borderColor: "divider",
				boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
			}}
		>
			{/* Overlay hint */}
			{!readOnly && (
				<Box
					sx={{
						position: "absolute",
						top: 10,
						left: "50%",
						transform: "translateX(-50%)",
						zIndex: 1000,
						bgcolor: "rgba(0,0,0,0.55)",
						color: "#fff",
						px: 1.5,
						py: 0.5,
						borderRadius: 5,
						display: "flex",
						alignItems: "center",
						gap: 0.5,
						pointerEvents: "none",
					}}
				>
					<MyLocationIcon sx={{ fontSize: 14 }} />
					<Typography variant="caption">Click to set pin</Typography>
				</Box>
			)}

			<MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%", zIndex: 1 }} scrollWheelZoom={true}>
				<TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
				<MapSizeFixer />
				{!readOnly && <ClickHandler onChange={onChange} />}
				<Recenter lat={lat} lng={lng} />
				{lat && lng && <Marker position={[lat, lng] as LatLngExpression} />}
			</MapContainer>
		</Box>
	);
}
